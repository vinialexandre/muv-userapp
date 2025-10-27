import { View, Pressable, Image as RNImage } from 'react-native';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  return (
    <View className="w-full bg-white px-4 pt-8 pb-3 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <RNImage source={require('../assets/logo-muv.png')} style={{ height: 60, width: 60 }} />
        <Pressable
          onPress={onOpenMenu}
          className="rounded-lg p-2 flex items-center justify-center"
        >
          <Icon name="menu" size={24} />
        </Pressable>
      </View>
    </View>
  );
}