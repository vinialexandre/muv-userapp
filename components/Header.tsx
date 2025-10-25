import { View, Pressable, Image as RNImage } from 'react-native';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  return (
    <View className="w-full bg-white px-4 mb-6 absolute top-0 left-0 right-0 z-50">
      <View className="flex items-center">
        <RNImage source={require('../assets/logo-muv.png')} style={{ height: 80, width: 80 }} />
      </View>
      <Pressable
        onPress={onOpenMenu}
        className="absolute top-4 right-4 rounded-lg p-2 flex items-center justify-center"
      >
        <Icon name="menu" size={24} />
      </Pressable>
      <View className="h-px bg-gray-200" />
    </View>
  );
}