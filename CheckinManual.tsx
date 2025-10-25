import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform, ScrollView, Modal, Alert } from 'react-native';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import { Toast, ToastRoot } from './components/ui/ToastAdapter';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import Router from './router';
import { auth, db } from './firebase';
import { collection, query, where, orderBy, getDocs, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';




export default function CheckinManual() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [checkins, setCheckins] = useState<any[]>([]);
  const [hasCheckinToday, setHasCheckinToday] = useState(false);

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    Router.navigate(path);
  };

  const getCurrentStudentId = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    let qs = await getDocs(query(collection(db, 'students'), where('uid', '==', user.uid)));
    if (qs.empty) qs = await getDocs(query(collection(db, 'students'), where('authUid', '==', user.uid)));
    if (qs.empty) throw new Error('Cadastro não encontrado');
    return qs.docs[0].id as string;
  };

  const parseFromId = (id: string) => {
    try {
      if (!id) return null;
      const parts = String(id).split('_');
      const ymd = parts.find(p => /^\d{8}$/.test(p));
      const hms = parts.find(p => /^\d{6}$/.test(p));
      if (!ymd) return null;
      const y = Number(ymd.slice(0, 4));
      const m = Number(ymd.slice(4, 6)) - 1;
      const d = Number(ymd.slice(6, 8));
      let hh = 0, mm = 0, ss = 0;
      if (hms) { hh = Number(hms.slice(0, 2)); mm = Number(hms.slice(2, 4)); ss = Number(hms.slice(4, 6)); }
      return new Date(Date.UTC(y, m, d, hh, mm, ss));
    } catch { return null; }
  };

  const toDateSafe = (v: any, id?: string): Date | null => {
    try {
      if (!v) return parseFromId(id || '');
      if (v instanceof Date) return v;
      if (typeof v?.toDate === 'function') {
        const d = v.toDate();
        if (!isNaN(d.getTime())) return d;
      }
      if (typeof v === 'string') {
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d;
      }
      if (typeof v === 'number') {
        const ms = v < 1e12 ? v * 1000 : v;
        const d = new Date(ms);
        if (!isNaN(d.getTime())) return d;
      }
      if (v && typeof v === 'object' && typeof v.seconds === 'number') {
        const d = new Date(v.seconds * 1000);
        if (!isNaN(d.getTime())) return d;
      }
      return parseFromId(id || '');
    } catch {
      return parseFromId(id || '');
    }
  };

  const formatPt = (value: any, id?: string) => {
    const d = toDateSafe(value, id);
    if (!d || isNaN(d.getTime())) return { date: 'Invalid Date', time: 'Invalid Date' };
    const date = d.toLocaleDateString('pt-BR');
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date, time };
  };

  const loadCheckins = async () => {
    try {
      const studentId = await getCurrentStudentId();
      const q1 = query(collection(db, 'checkins'), where('studentId', '==', studentId), orderBy('createdAt', 'desc'));
      const q2 = query(collection(db, 'checkins'), where('studentID', '==', studentId), orderBy('createdAt', 'desc'));
      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const map = new Map<string, any>();
      const today = new Date().toLocaleDateString('pt-BR');
      let todayExists = false;
      [...s1.docs, ...s2.docs].forEach((d) => { 
        const data = d.data(); 
        const { date, time } = formatPt(data.createdAt, d.id); 
        if (date === today) todayExists = true;
        map.set(d.id, { id: d.id, date, time }); 
      });
      setCheckins(Array.from(map.values()));
      setHasCheckinToday(todayExists);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => { if (user) loadCheckins(); else Router.navigate('/'); });
    return () => unsub();
  }, []);

  return (
    <View className="min-h-screen bg-gray-50 w-full max-[768px]:bg-white max-[768px]:overflow-y-auto pt-24">
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      <View className="px-4 pb-6 max-[768px]:px-0 max-[768px]:pb-6">
        <View className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-[768px]:rounded-none max-[768px]:shadow-none max-[768px]:border-0 max-[768px]:min-h-screen">
          <View className="p-6 max-[768px]:p-5 border-b border-gray-100">
            <View className="flex justify-between items-center">
              <View className="flex items-center gap-3 max-[768px]:gap-4">
                <View className="max-[768px]:bg-blue-50 max-[768px]:p-2 max-[768px]:rounded-xl">
                  <Icon name="clock" size={20} className="max-[768px]:text-blue-600" />
                </View>
                <Text className="text-lg font-bold max-[768px]:text-xl max-[768px]:text-gray-900">Check-in Manual</Text>
              </View>
              <Pressable
                onPress={() => {
                  if (hasCheckinToday) {
                    Toast.show({ icon: 'fail', position: 'bottom', content: 'Não é possível fazer mais de um check-in por dia' });
                    return;
                  }
                  setNewTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }));
                  setNewDate(new Date().toLocaleDateString('pt-BR'));
                  setIsCreateOpen(true);
                }}
                disabled={hasCheckinToday}
                className={`${hasCheckinToday ? 'bg-gray-300' : 'bg-yellow-300'} border-none rounded-xl w-11 h-11 flex items-center justify-center shadow-md max-[768px]:w-14 max-[768px]:h-14 max-[768px]:rounded-2xl max-[768px]:shadow-lg`}
              >
                <Text className={`text-xl font-bold max-[768px]:text-2xl ${hasCheckinToday ? 'text-gray-500' : 'text-black'}`}>+</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView className="p-6 max-[768px]:p-4 max-[768px]:flex-1">
            <View className="flex flex-col gap-4 max-[768px]:gap-6">
              {checkins.length === 0 ? (
                <View className="text-center py-12 max-[768px]:py-16">
                  <View className="max-[768px]:bg-gray-50 max-[768px]:w-20 max-[768px]:h-20 max-[768px]:rounded-full max-[768px]:flex max-[768px]:items-center max-[768px]:justify-center max-[768px]:mx-auto max-[768px]:mb-4">
                    <Icon name="clock" size={24} className="max-[768px]:text-gray-400" />
                  </View>
                  <Text className="text-gray-500 max-[768px]:text-lg max-[768px]:font-medium">Nenhum check-in registrado</Text>
                  <Text className="text-gray-400 text-sm max-[768px]:text-base max-[768px]:mt-2">Toque no botão + para adicionar</Text>
                </View>
              ) : (
                checkins.map((checkin) => (
                  <View key={checkin.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm max-[768px]:bg-white max-[768px]:border-gray-100 max-[768px]:rounded-2xl max-[768px]:p-6 max-[768px]:shadow-md max-[768px]:border-2">
                    <View className="flex justify-between items-center">
                      <Text className="font-semibold text-lg text-gray-900 max-[768px]:text-2xl max-[768px]:font-bold">
                        {checkin.time}
                      </Text>
                      <Text className="text-base text-gray-700 font-medium max-[768px]:text-lg max-[768px]:text-gray-600 max-[768px]:font-normal">
                        {checkin.date}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal
        visible={isCreateOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateOpen(false)}
      >
        <View className="fixed inset-0 z-50">
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setIsCreateOpen(false)}
          />
          <View className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-6 h-[90vh] md:inset-y-10 md:mx-auto md:max-w-md md:rounded-2xl md:h-auto max-[768px]:rounded-t-3xl max-[768px]:p-6 max-[768px]:h-[85vh]">
            <ScrollView>
              <View className="flex justify-between items-center mb-6 max-[768px]:mb-8 max-[768px]:pb-4 max-[768px]:border-b max-[768px]:border-gray-100">
                <Text className="text-2xl font-bold max-[768px]:text-3xl max-[768px]:text-gray-900">Novo Check-in</Text>
                <Pressable
                  onPress={() => setIsCreateOpen(false)}
                  className="bg-transparent max-[768px]:bg-gray-100 max-[768px]:w-10 max-[768px]:h-10 max-[768px]:rounded-full max-[768px]:flex max-[768px]:items-center max-[768px]:justify-center"
                >
                  <Icon name="x" size={20} />
                </Pressable>
              </View>

              <View className="mb-6 max-[768px]:mb-8">
                <Text className="block text-xl font-semibold mb-3 max-[768px]:text-lg max-[768px]:font-bold max-[768px]:text-gray-800 max-[768px]:mb-4">Hora</Text>
                <Input
                  value={newTime}
                  onChange={(text) => {
                    let v = String(text || '').replace(/\D/g, '').slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2);
                    setNewTime(v);
                  }}
                  maxLength={5}
                  inputMode="numeric"
                  placeholder="HH:MM"
                  className="w-full p-3 text-xl border border-gray-300 rounded-2xl max-[768px]:p-5 max-[768px]:text-2xl max-[768px]:border-2 max-[768px]:border-gray-300 max-[768px]:rounded-3xl max-[768px]:bg-gray-50"
                />
              </View>

              <View className="mb-8 max-[768px]:mb-12">
                <Text className="block text-xl font-semibold mb-3 max-[768px]:text-lg max-[768px]:font-bold max-[768px]:text-gray-800 max-[768px]:mb-4">Data</Text>
                <Input
                  value={newDate}
                  onChange={(text) => {
                    let v = String(text || '').replace(/\D/g, '').slice(0, 8);
                    if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                    else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                    setNewDate(v);
                  }}
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  className="w-full p-3 text-xl border border-gray-300 rounded-2xl max-[768px]:p-5 max-[768px]:text-2xl max-[768px]:border-2 max-[768px]:border-gray-300 max-[768px]:rounded-3xl max-[768px]:bg-gray-50"
                />
              </View>

              <View className="max-[768px]:fixed max-[768px]:bottom-0 max-[768px]:left-0 max-[768px]:right-0 max-[768px]:p-6 max-[768px]:bg-white max-[768px]:border-t max-[768px]:border-gray-100">
                <Button
                  onClick={async () => {
                    if (!newTime || !newDate) {
                      if (Platform.OS === 'web') {
                        alert('Preencha hora e data');
                      } else {
                        Alert.alert('', 'Preencha hora e data');
                      }
                      return;
                    }
                    try {
                      const studentId = await getCurrentStudentId();
                      const pad = (n: number) => String(n).padStart(2, '0');
                      const [ddStr, mmStr, yyStr] = String(newDate).split('/');
                      const [hhStr, minStr] = String(newTime).split(':');
                      const dd = parseInt(ddStr, 10), mm = parseInt(mmStr, 10), yyyy = parseInt(yyStr, 10);
                      const hh = parseInt(hhStr, 10), min = parseInt(minStr, 10);
                      if (!yyyy || !mm || !dd || isNaN(hh) || isNaN(min)) {
                        if (Platform.OS === 'web') {
                          alert('Data ou hora inválida');
                        } else {
                          Alert.alert('', 'Data ou hora inválida');
                        }
                        return;
                      }
                      const when = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
                      const ymd = `${yyyy}${pad(mm)}${pad(dd)}`;
                      const id = `${studentId}_${ymd}`;
                      await setDoc(doc(db, 'checkins', id), {
                        id,
                        studentId,
                        source: 'manual',
                        createdAt: when,
                      });

                      setIsCreateOpen(false);
                      setNewTime('');
                      setNewDate('');
                      await loadCheckins();
                      setTimeout(() => {
                        Toast.show({ icon: 'success', position: 'bottom', duration: 1500, content: 'Check-in salvo!' });
                      }, 10);
                    } catch (e: any) {
                      Toast.show({ icon: 'fail', position: 'bottom', content: e?.message || 'Erro ao salvar check-in' });
                    }
                  }}
                  block
                  className="bg-yellow-300 rounded-2xl py-4 max-[768px]:py-5 max-[768px]:rounded-3xl max-[768px]:shadow-lg"
                >
                  <Text className="text-black text-xl font-semibold max-[768px]:text-2xl max-[768px]:font-bold">Salvar Check-in</Text>
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
      <ToastRoot />
    </View>
  );
}

