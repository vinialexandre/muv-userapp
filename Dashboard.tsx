import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import { Popup } from './components/ui/Popup';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import Router from './router';

const mockCheckins = [
  { id: 1, time: '08:30', date: '20/09/2025', status: 'PRESENTE' },
  { id: 2, time: '09:15', date: '21/09/2025', status: 'PRESENTE' },
  { id: 3, time: '10:00', date: '22/09/2025', status: 'AUSENTE' },
  { id: 4, time: '11:20', date: '23/09/2025', status: 'PRESENTE' },
];


export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [checkins, setCheckins] = useState(mockCheckins);


  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    Router.navigate(path);
  };

  return (
    <View className="min-h-screen bg-gray-50 w-full pt-24">
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      <View className="px-4">
        <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-full">
          <View className="flex justify-between items-center mb-5">
            <View className="flex-row items-center gap-2">
              <Icon name="clock" size={20} />
              <Text className="text-lg font-bold">Check-in Manual</Text>
            </View>
            <Pressable onPress={() => setIsCreateOpen(true)} className="bg-yellow-300 rounded-xl w-11 h-11 items-center justify-center shadow-md">
              <Text className="text-xl font-bold text-black">+</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1">
            <View className="flex flex-col gap-4">
              {checkins.map(checkin => (
                <View key={checkin.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-lg mb-3 text-gray-900">
                        {checkin.time}
                      </Text>
                    </View>
                    <Text className="text-base text-gray-700 font-medium">
                      {checkin.date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <Popup
        visible={isCreateOpen}
        onMaskClick={() => setIsCreateOpen(false)}
        position="bottom"
        bodyStyle={{ height: '90vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'auto' }}
      >
        <View className="w-full p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Novo Check-in</Text>
            <Pressable onPress={() => setIsCreateOpen(false)} className="p-2">
              <Icon name="x" size={20} />
            </Pressable>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-medium mb-2">Hora</Text>
            <Input
              value={newTime}
              onChange={(text: string) => {
                let v = String(text || '').replace(/\D/g, '').slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2);
                setNewTime(v);
              }}
              maxLength={5}
              inputMode="numeric"
              placeholder="HH:MM"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </View>

          <View className="mb-6">
            <Text className="block text-sm font-medium mb-2">Data</Text>
            <Input
              value={newDate}
              onChange={(text: string) => {
                let v = String(text || '').replace(/\D/g, '').slice(0, 8);
                if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                setNewDate(v);
              }}
              maxLength={10}
              inputMode="numeric"
              placeholder="DD/MM/AAAA"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </View>

          <Button
            onClick={() => {
              if (!newTime || !newDate) {
                alert('Preencha hora e data');
                return;
              }
              setCheckins([...checkins, { id: Date.now(), time: newTime, date: newDate, status: 'PRESENTE' }]);
              setIsCreateOpen(false);
              setNewTime('');
              setNewDate('');
            }}
            block
            className="bg-black rounded-lg py-3"
          >
            <Text className="text-white text-center">Salvar</Text>
          </Button>
        </View>
      </Popup>

      <StatusBar style="auto" />
    </View>
  );
}