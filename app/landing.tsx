import React, { useState } from 'react';
import { Button, FlatList, Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ClipboardList, CogIcon, Dna, LogOut, Microscope, TestTube2, TrendingUp } from 'lucide-react-native';
import { HeadingDivider } from '@/components/navigation/HeadingDivider';
import SimpleButton from '@/components/navigation/SimpleButton';
import VSpace from '@/components/navigation/VSpace';

export default function LandingScreen() {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const openInBrowser = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <FlatList
      //   contentContainerStyle={{ backgroundColor: '#F9FAFB', flex: 1 }}
      data={[]}
      renderItem={null}
      ListHeaderComponent={
        <LinearGradient colors={['#fff', '#f5f5f5']} style={{ flex: 1 }}>
          <View className="flex-1 pt-20">
            <Text className="mt-10 pl-6 text-xl font-semibold text-gray-600">{formatDate(new Date())}</Text>
            <Image
              source={require('@/assets/dr1.png')}
              style={{
                width: '100%',
                height: 150,
                paddingHorizontal: 20,
                resizeMode: 'cover',
                borderRadius: 20,
                marginVertical: 20,
              }}
            />
            <View className="h-3"></View>
            <HeadingDivider hideRightIcon={true} iconName="albums-outline" title="Clinical Workspace" />
            <View
              style={{
                // backgroundColor: '#F9FAFB',

                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                padding: 20,
                gap: 20,
                //   borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <SimpleButton
                icon={ClipboardList}
                heading="Patient Reports"
                subheading="My patients Recent labs & imaging"
                onPress={() => router.replace('/patients' as any)}
              />

              <SimpleButton
                icon={TestTube2}
                heading="Order Tests"
                subheading="1Ceall.Ai tests for Pathology & Genomics"
                onPress={() => openInBrowser('https://1cell.ai/in/products/')}
              />

              <SimpleButton
                icon={Dna}
                heading="MTB"
                subheading="Case discussions & insights from MTB"
                onPress={() => openInBrowser('https://mtb.1cell.ai/reports')}
              />
              <SimpleButton
                icon={CogIcon}
                heading="Settings"
                subheading="Profile & App Preferences"
                onPress={() => router.replace('/patients' as any)}
              />
            </View>
            <HeadingDivider hideRightIcon={true} iconName="book-outline" title="Education & Research" />
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                padding: 20,
                gap: 20,
                marginBottom: 20,
              }}
            >
              <SimpleButton
                icon={Microscope}
                heading="Publcations"
                subheading="1Cell.Ai Posters & publications Library"
                onPress={() => openInBrowser('https://publication-agent.1cell.ai/')}
              />

              <SimpleButton
                icon={TrendingUp}
                heading="Oncology Trends"
                subheading="Latest in Oncology Research around NGS"
                onPress={() => router.replace('/news' as any)}
              />
            </View>
            <Image
              source={require('@/assets/banner.png')}
              style={{
                width: '100%',
                height: 120,
                paddingHorizontal: 20,
                resizeMode: 'cover',
                borderRadius: 20,
                marginVertical: 10,
              }}
            />
            <View className="h-3"></View>
          </View>
        </LinearGradient>
      }
    />
  );
}
