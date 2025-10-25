import { View, Pressable, Image as RNImage } from 'react-native';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  return (
    <View className="w-full bg-white px-4 mb-6 absolute top-0 left-0 right-0 z-50">
      <View className="flex-row items-center justify-between" style={{ marginTop: 20, marginBottom: -20 }}>
        <RNImage source={require('../assets/logo-muv.png')} style={{ height: 80, width: 80, marginLeft: 8 }} />
        <Pressable
          onPress={onOpenMenu}
          className="rounded-lg p-2 flex items-center justify-center"
        >
          <Icon name="menu" size={24} />
        </Pressable>
      </View>
      <View className="h-px bg-gray-200 mt-2" />
    </View>
  );
}