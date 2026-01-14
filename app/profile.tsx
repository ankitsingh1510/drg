import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, MapPin, Phone, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ESignatureModal from '@/components/auth/ESignatureModal';
import MfaChangeWarningModal from '@/components/auth/MfaChangeWarningModal';
import IconNavBar from '@/components/navigation/IconNavBar';
import {
  FieldDropdownModal,
  ProfileActionButtons,
  ProfileCheckboxField,
  ProfileDropdownField,
  ProfileHeader,
  ProfileTextField,
} from '@/components/profile';
import { colors } from '@/constants/colors';
import { useThemeSync } from '@/hooks/useThemeSync';
import { usersAPI } from '@/services/users';
import type { EnumOption, ProfileField, UserProfileData } from '@/types/users';
import { toast } from '@/util/toast';

const Profile = () => {
  const router = useRouter();

  const { theme } = useThemeSync();
  const isDarkMode = theme === 'dark';

  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [formFields, setFormFields] = useState<ProfileField[]>([]);
  const [originalMfaEnabled, setOriginalMfaEnabled] = useState<string>('');
  const [originalFormFields, setOriginalFormFields] = useState<ProfileField[]>([]);
  const [showESignatureModal, setShowESignatureModal] = useState(false);
  const [showReloginModal, setShowReloginModal] = useState(false);
  const [mfaChanged, setMfaChanged] = useState(false);
  const [eSignatureUsername, setESignatureUsername] = useState('');
  const [eSignatureError, setESignatureError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getUserProfile();
      if (response?.data) {
        setProfileData(response.data);
        setFormFields(response.data.fields);
        // Stored original MFA state
        const mfaField = response.data.fields.find(f => f.name === 'isMfaEnabled');
        setOriginalMfaEnabled(mfaField?.value?.toString() || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profileData) {
      setFormFields([...profileData.fields]);
    }
    setIsEditing(false);
  };

  const validateRequiredFields = (): boolean => {
    const emptyRequiredFields = formFields.filter(field => {
      if (!field.required || !field.visible) return false;

      if (typeof field.value === 'object' && field.value !== null) {
        return false;
      }
      return !field.value || field.value.toString().trim() === '';
    });

    if (emptyRequiredFields.length > 0) {
      const fieldNames = emptyRequiredFields.map(f => f.displayLabel).join(', ');
      toast.error('Required Fields Missing', `Please fill: ${fieldNames}`, 4000);
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateRequiredFields()) {
      return;
    }
    // Check if MFA was changed
    const currentMfaField = formFields.find(f => f.name === 'isMfaEnabled');
    const currentMfaValue = currentMfaField?.value?.toString() || '';
    const isMfaChanged = originalMfaEnabled !== currentMfaValue;
    setMfaChanged(isMfaChanged);

    // If MFA changed, show relogin warning first
    if (isMfaChanged) {
      setShowReloginModal(true);
    } else {
      // Otherwise, proceed directly to eSignature modal
      proceedToESignature();
    }
  };

  const proceedToESignature = () => {
    const emailField = formFields.find(f => f.name === 'email');
    const emailValue = emailField?.value?.toString() || '';
    setESignatureUsername(emailValue);
    setOriginalFormFields([...formFields]);
    setShowESignatureModal(true);
  };

  const handleESignatureSubmit = async (password: string, changeReasonDetail: string) => {
    try {
      setIsLoading(true);
      setShowESignatureModal(false);
      const response = await usersAPI.updateUserProfile({
        userMasterModel: { fields: formFields },
        eSignatureModel: {
          username: eSignatureUsername,
          password,
          changeReasonDetail,
        },
      });

      if (response?.statusCode !== 200 && response?.statusCode !== 201) {
        const errorMessage = (response?.message || 'Failed to update profile').replace(/\n/g, ' ').trim();
        setFormFields([...originalFormFields]);
        setESignatureError(errorMessage);
        setShowESignatureModal(true);
        setIsLoading(false);
        return;
      }

      toast.success('Profile Updated', response?.data?.msg || 'Your profile has been updated successfully');
      setIsEditing(false);
      setESignatureUsername('');
      setESignatureError('');
      if (mfaChanged) {
        setIsLoading(false);
        setTimeout(() => {
          router.replace('/login?logout=true' as any);
        }, 500);
      } else {
        await loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error', 'Failed to update profile');
      setFormFields([...originalFormFields]);
      setShowESignatureModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelogin = () => {
    setShowReloginModal(false);
    proceedToESignature();
  };

  const updateFieldValue = (fieldName: string, value: any) => {
    setFormFields(prev => {
      // When isMfaEnabled or emailMfa changes, sync both fields
      if (fieldName === 'isMfaEnabled' || fieldName === 'emailMfa') {
        return prev.map(field => {
          if (field.name === 'isMfaEnabled' || field.name === 'emailMfa') {
            return { ...field, value };
          }
          return field;
        });
      }
      // For other fields, update only that field
      return prev.map(field => (field.name === fieldName ? { ...field, value } : field));
    });
  };

  const getFieldValue = (field: ProfileField): string => {
    if (typeof field.value === 'object' && field.value !== null) {
      return (field.value as EnumOption).label || '';
    }
    return field.value?.toString() || '';
  };

  const renderField = (field: ProfileField) => {
    if (!field.visible) return null;
    const isReadOnly = field.readOnly || !isEditing;
    const fieldValue = getFieldValue(field);

    if (['text', 'alpha', 'email'].includes(field.widgetType)) {
      return (
        <ProfileTextField
          key={field.name}
          field={field}
          value={fieldValue}
          isReadOnly={isReadOnly}
          isDarkMode={isDarkMode}
          onChangeText={text => updateFieldValue(field.name, text)}
        />
      );
    }

    if (field.widgetType === 'dropdown' && field.enumlist) {
      return (
        <React.Fragment key={field.name}>
          <ProfileDropdownField
            field={field}
            value={fieldValue}
            isReadOnly={isReadOnly}
            isDarkMode={isDarkMode}
            onPress={() => setShowDropdown(field.name)}
          />
          <FieldDropdownModal
            visible={showDropdown === field.name}
            title={field.displayLabel}
            options={field.enumlist}
            onSelect={option => updateFieldValue(field.name, option)}
            onClose={() => setShowDropdown(null)}
          />
        </React.Fragment>
      );
    }

    if (field.widgetType === 'checkbox') {
      // For emailMfa, show it as ON if isMfaEnabled is ON
      let isChecked = field.value === '1' || field.value === 1;
      if (field.name === 'emailMfa') {
        const mfaEnabledField = formFields.find(f => f.name === 'isMfaEnabled');
        const isMfaEnabled = mfaEnabledField?.value === '1' || mfaEnabledField?.value === 1;
        isChecked = isMfaEnabled;
      }
      if (field.name === 'emailMfa') {
        const mfaEnabledField = formFields.find(f => f.name === 'isMfaEnabled');
        const isMfaEnabled = mfaEnabledField?.value === '1' || mfaEnabledField?.value === 1;
        if (!isMfaEnabled) return null;
      }
      return (
        <ProfileCheckboxField
          key={field.name}
          field={field}
          isChecked={isChecked}
          isReadOnly={isReadOnly}
          isDarkMode={isDarkMode}
          onValueChange={enabled => updateFieldValue(field.name, enabled ? '1' : '')}
        />
      );
    }

    return null;
  };

  const renderIcon = (sectionName: string) => {
    const iconColor = isDarkMode ? colors.dark.text : colors.light.text;
    switch (sectionName) {
      case 'Primary Details':
        return <User size={20} color={iconColor} />;
      case 'Address':
        return <MapPin size={20} color={iconColor} />;
      case 'Contact Details':
        return <Phone size={20} color={iconColor} />;
      case 'Secure Your Account with 2FA':
        return <Lock size={20} color={iconColor} />;
      default:
        return null;
    }
  };

  const groupFieldsByDisplayGroup = () => {
    const groups: { [key: string]: ProfileField[] } = {};
    formFields.forEach(field => {
      if (
        field.visible &&
        field.displayGroup !== 'Account Details' &&
        field.displayGroup !== 'Secure Your Account with 2FA' &&
        field.name !== 'organization' &&
        field.name !== 'userType'
      ) {
        if (!groups[field.displayGroup]) {
          groups[field.displayGroup] = [];
        }
        groups[field.displayGroup].push(field);
      }
    });
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.displayOrder - b.displayOrder);
    });
    return groups;
  };

  const getName = () => {
    const nameField = formFields.find(f => f.name === 'name');
    const lnameField = formFields.find(f => f.name === 'lname');
    const name = getFieldValue(nameField || ({} as ProfileField));
    const lname = getFieldValue(lnameField || ({} as ProfileField));
    return { name, lname };
  };

  if (isLoading && !profileData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FDF5E6] dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.common.primary} />
      </SafeAreaView>
    );
  }
  const { name, lname } = getName();
  const groupedFields = groupFieldsByDisplayGroup();

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      <View className="mb-2 flex-row items-center justify-between px-5 pb-2">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full border border-gray-300 p-2 active:bg-gray-200 dark:border-gray-600 dark:active:bg-gray-700"
          >
            <ArrowLeft size={24} color={isDarkMode ? colors.dark.text : colors.light.text} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Profile</Text>
        </View>
        <IconNavBar />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <ProfileHeader
          firstName={name}
          lastName={lname}
          organizationName={profileData?.orgMapping.organizationName || ''}
        />

        {Object.entries(groupedFields).map(([groupName, fields]) => (
          <View key={groupName} className="mb-6 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <View className="mb-4 flex-row items-center gap-3">
              {renderIcon(groupName)}
              <Text className="flex-1 text-lg font-semibold text-gray-800 dark:text-gray-100">{groupName}</Text>
            </View>
            {fields.map(field => renderField(field))}
          </View>
        ))}

        {/* Buttons: Edit Profile, Save, Cancel */}
        <ProfileActionButtons
          isEditing={isEditing}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <View className="h-6" />
      </ScrollView>
      <ESignatureModal
        visible={showESignatureModal}
        username={eSignatureUsername}
        errorMessage={eSignatureError}
        onCancel={() => {
          setFormFields([...originalFormFields]);
          setShowESignatureModal(false);
          setESignatureError('');
        }}
        onConfirm={handleESignatureSubmit}
      />
      <MfaChangeWarningModal visible={showReloginModal} onContinue={handleRelogin} />
    </SafeAreaView>
  );
};

export default Profile;
