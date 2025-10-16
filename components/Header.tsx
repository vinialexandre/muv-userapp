import { Image as RNImage } from 'react-native';
import { Icon } from './Icon';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <div className="w-full bg-white px-4 mb-6">
      <div className="flex justify-between items-center pb-4">
        <RNImage source={require('../assets/logo-muv.png')} style={{ height: 80, width: 80 }} />
        <button
          onClick={onLogout}
          className="bg-transparent border border-black rounded-lg px-4 py-2 text-sm cursor-pointer flex items-center gap-2"
        >
          <Icon name="logOut" size={20} />
        </button>
      </div>
      <div className="border-b border-gray-200"></div>
    </div>
  );
}