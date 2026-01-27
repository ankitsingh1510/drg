import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building, Calendar, Globe, Hash, Lock, Mail, MapPin, Phone, User } from 'lucide-react-native';
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
import { useAuth } from '@/context/AuthContext';
import { useThemeSync } from '@/hooks/useThemeSync';
import { usersAPI } from '@/services/users';
import type { EnumOption, ProfileField, UserProfileData } from '@/types/users';
import { toast } from '@/util/toast';

const fieldIconMap: { [key: string]: any } = {
  name: User,
  lname: User,
  email: Mail,
  mobile: Phone,
  phone: Phone,
  address: MapPin,
  town: MapPin,
  state: Globe,
  country: Globe,
  zip: Hash,
  organization: Building,
  userType: User,
  dob: Calendar,
};

const Profile = () => {
  const router = useRouter();
  const { user } = useAuth();
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

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    if (profileData) setFormFields([...profileData.fields]);
    setIsEditing(false);
  };

  const validateRequiredFields = (): boolean => {
    const emptyRequiredFields = formFields.filter(field => {
      if (!field.required || !field.visible) return false;
      if (typeof field.value === 'object' && field.value !== null) return false;
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
    if (!validateRequiredFields()) return;
    const currentMfaField = formFields.find(f => f.name === 'isMfaEnabled');
    const currentMfaValue = currentMfaField?.value?.toString() || '';
    const isMfaChanged = originalMfaEnabled !== currentMfaValue;
    setMfaChanged(isMfaChanged);

    if (isMfaChanged) {
      setShowReloginModal(true);
    } else {
      proceedToESignature();
    }
  };

  const proceedToESignature = () => {
    setESignatureUsername(user?.username || '');
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
        setTimeout(() => router.replace('/login?logout=true' as any), 500);
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
      if (fieldName === 'isMfaEnabled' || fieldName === 'emailMfa') {
        return prev.map(field => {
          if (field.name === 'isMfaEnabled' || field.name === 'emailMfa') return { ...field, value };
          return field;
        });
      }
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
    const FieldIcon = fieldIconMap[field.name];

    if (['text', 'alpha', 'email'].includes(field.widgetType)) {
      return (
        <ProfileTextField
          key={field.name}
          field={field}
          value={fieldValue}
          isReadOnly={isReadOnly}
          isDarkMode={isDarkMode}
          icon={FieldIcon}
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
            innerIcon={FieldIcon}
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
      let isChecked = field.value === '1' || field.value === 1;
      if (field.name === 'emailMfa') {
        const mfaEnabledField = formFields.find(f => f.name === 'isMfaEnabled');
        isChecked = mfaEnabledField?.value === '1' || mfaEnabledField?.value === 1;
        if (!isChecked) return null;
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

  const renderSectionHeader = (sectionName: string) => {
    let icon;
    let lightBg;

    switch (sectionName) {
      case 'Primary Details':
        icon = <User size={18} color="#3b82f6" />;
        lightBg = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff';
        break;
      case 'Address':
        icon = <MapPin size={18} color="#10b981" />;
        lightBg = isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5';
        break;
      case 'Contact Details':
        icon = <Phone size={18} color="#f59e0b" />;
        lightBg = isDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb';
        break;
      case 'Secure Your Account with 2FA':
        icon = <Lock size={18} color="#8b5cf6" />;
        lightBg = isDarkMode ? 'rgba(139, 92, 246, 0.15)' : '#f5f3ff';
        break;
      default:
        icon = <User size={18} color="#6b7280" />;
        lightBg = isDarkMode ? 'rgba(107, 114, 128, 0.15)' : '#f3f4f6';
    }

    return (
      <View className="mb-6 flex-row items-center gap-3">
        <View style={{ backgroundColor: lightBg }} className="h-10 w-10 items-center justify-center rounded-2xl">
          {icon}
        </View>
        <Text className="flex-1 text-lg font-bold tracking-tight text-gray-800 dark:text-gray-100">{sectionName}</Text>
      </View>
    );
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
        if (!groups[field.displayGroup]) groups[field.displayGroup] = [];
        groups[field.displayGroup].push(field);
      }
    });
    Object.keys(groups).forEach(key => groups[key].sort((a, b) => a.displayOrder - b.displayOrder));
    return groups;
  };

  const getName = () => {
    const nameField = formFields.find(f => f.name === 'name');
    const lnameField = formFields.find(f => f.name === 'lname');
    const nameStr = getFieldValue(nameField || ({} as ProfileField));
    const lnameStr = getFieldValue(lnameField || ({} as ProfileField));
    return { name: nameStr, lname: lnameStr };
  };

  if (isLoading && !profileData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FDF5E6] dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.common.primary} />
      </SafeAreaView>
    );
  }

  const { name: fName, lname: lName } = getName();
  const groupedFields = groupFieldsByDisplayGroup();

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="mb-2 flex-row items-center justify-between px-5 pb-2" pointerEvents="box-none">
          <View className="flex-row items-center gap-4">
            <Pressable
              hitSlop={10}
              onPress={() => router.back()}
              activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800"
            >
              <ArrowLeft size={22} color={isDarkMode ? colors.dark.text : colors.light.text} strokeWidth={2.5} />
            </Pressable>
            <Text className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">My Profile</Text>
          </View>
          <IconNavBar />
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <ProfileHeader
            firstName={fName}
            lastName={lName}
            organizationName={profileData?.orgMapping.organizationName || ''}
          />

        {Object.entries(groupedFields).map(([groupName, fields]) => (
          <View key={groupName} style={styles.card} className="mb-6 rounded-3xl bg-white p-6 dark:bg-gray-800">
            {renderSectionHeader(groupName)}
            <View className="space-y-4">{fields.map(field => renderField(field))}</View>
          </View>
        ))}

            <ProfileActionButtons
            isEditing={isEditing}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
          <View className="h-10" />
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
