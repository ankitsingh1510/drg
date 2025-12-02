import React, { useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ClipboardList, CogIcon, Dna, LogOut, Microscope, TestTube2, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeadingDivider } from '@/components/navigation/HeadingDivider';
import SimpleButton from '@/components/navigation/SimpleButton';

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
      contentContainerStyle={{ backgroundColor: '#F9FAFB', flexGrow: 1 }}
      data={[]} // No main data — we're just rendering headers + NewsCard
      renderItem={null}
      ListHeaderComponent={
        <View className="flex-1  pt-20">
          <Text className="mb-6 pl-4 text-xl font-semibold text-gray-600">{formatDate(new Date())}</Text>

          <HeadingDivider hideRightIcon={true} iconName="albums-outline" title="Clinical Workspace" />
          <View
            style={{
              // flex: 1,
              backgroundColor: '#F9FAFB',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
              gap: 20,
              borderRadius: 12,
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
              // flex: 1,
              // backgroundColor: '#F9FAFB',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
              gap: 20,
              borderRadius: 12,
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
              onPress={() => router.replace('/patients' as any)}
            />
          </View>
        </View>
      }
    />
  );
}
