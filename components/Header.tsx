import { Image as RNImage } from 'react-native';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  return (
    <div className="w-full bg-white px-4 mb-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <RNImage source={require('../assets/logo-muv.png')} style={{ height: 80, width: 80}} />
      </div>
      <button
        onClick={onOpenMenu}
        className="absolute top-4 right-4 bg-transparent border-none text-black rounded-lg p-2 cursor-pointer flex items-center justify-center"
      >
        <Icon name="menu" size={24} />
      </button>
      <div className="border-b border-gray-200"></div>
    </div>
  );
}