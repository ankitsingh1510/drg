import { Image, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { FlatList } from 'react-native-gesture-handler';

export default function HScroller() {
  const data = [
    {
      url: 'https://nandiraju.github.io/drg/',
      image: require('@/assets/menu_images/1.png'),
      external: true,
    },
    {
      url: 'https://apps.apple.com/app/6747797336',
      image: require('@/assets/menu_images/5.png'),
      external: true,
    },
    {
      url: 'https://1cell.ai/in/poles2026/',
      image: require('@/assets/menu_images/3.png'),
      external: true,
    },
    {
      url: 'https://www.youtube.com/@1CellAi/videos',
      image: require('@/assets/menu_images/6.png'),
      external: true,
    },
  ];

  const handleItemPress = item => {
    WebBrowser.openBrowserAsync(item.url);
    console.log('Clicked:', item);
  };

  return (
    <View className=" flex-row items-center justify-center ">
      <FlatList
        data={data}
        horizontal
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View className="w-4" />}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <HCard item={item} onPress={() => handleItemPress(item)} />}
      />
    </View>
  );
}

function HCard({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* <View className="justify-center items-center"> */}
      <Image source={item.image} resizeMode="contain" className="h-[250px] w-[250px] rounded-3xl" />
      {/* </View> */}
    </TouchableOpacity>
  );
}
