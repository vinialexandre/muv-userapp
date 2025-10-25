import { View, Text, Pressable, Platform, Modal } from 'react-native';
import { Icon } from './Icon';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';


interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function Menu({ isOpen, onClose, onNavigate }: MenuProps) {
  const currentPath = Platform.OS === 'web' ? (window as any).location.pathname : '';

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="absolute inset-0 z-[200]">
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />
        <View className="absolute inset-0 items-center justify-center">
          <Pressable
            onPress={onClose}
            className="absolute top-6 right-6"
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
          >
            <Icon name="x" size={28} />
          </Pressable>

          <View className="flex flex-col gap-8 items-center">
            <Pressable
              onPress={() => onNavigate('/dados-usuario')}
              className={`flex-row items-center gap-4 px-8 py-5 rounded-xl ${currentPath === '/dados-usuario' ? 'bg-white/10' : 'bg-transparent'}`}
            >
              <Icon name="user" size={28} />
              <Text className="text-white text-xl">Seus Dados</Text>
            </Pressable>

            <Pressable
              onPress={() => onNavigate('/checkin-manual')}
              className={`flex-row items-center gap-4 px-8 py-5 rounded-xl ${currentPath === '/checkin-manual' ? 'bg-white/10' : 'bg-transparent'}`}
            >
              <Icon name="clock" size={28} />
              <Text className="text-white text-xl">Check-in Manual</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={async () => {
              try { await signOut(auth); } finally {
                if (Platform.OS === 'web') { (window as any).location.href = '/'; }
              }
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-row items-center gap-3"
          >
            <Text className="text-white text-xl">Sair</Text>
            <Icon name="logOut" size={28} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}