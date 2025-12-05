import React, { Component } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import NewsCard from '@/components/widgets/NewsCard';

export default class index extends Component {
  render() {
    return (
      // <SafeAreaView style={{ flex: 1 }}>
      //   <View className="flex-1 py-2">
      //     <NewsCard count={-1} />
      //     <Button title="Close" onPress={() => router.back()} />
      //   </View>
      // </SafeAreaView>

      <SafeAreaView className="flex-1 bg-white" style={{ backgroundColor: '#FDF5E6' }}>
        {/* <View className="flex-row items-start p-2 bg-transparent"> */}
        {/* <IconButton
          iconName="arrow-back-outline"
          size={25}
          onPress={() => router.back()}
        /> */}
        {/* </View> */}
        <View className="mb-2 items-end pb-2 pr-8">
          <IconNavBar />
        </View>

        <View className="flex-1">
          <NewsCard count={-1} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
