import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import 'antd-mobile/es/global';
import { Toast } from 'antd-mobile';

import './global.css';
import { auth, db } from './firebase';
import { collection, query, where, orderBy, getDocs, doc, setDoc } from 'firebase/firestore';


export default function CheckinManual() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [checkins, setCheckins] = useState<any[]>([]);

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };

  const getCurrentStudentId = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    if (user.email) {
      const q = query(collection(db, 'students'), where('email', '==', user.email));
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].id;
    }
    return user.uid;
  };

  const formatPt = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('pt-BR');
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date, time };
  };

  const loadCheckins = async () => {
    try {
      const studentId = await getCurrentStudentId();
      const q = query(
        collection(db, 'checkins'),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => {
        const { date, time } = formatPt(d.data().createdAt);
        return { id: d.id, date, time };
      });
      setCheckins(items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCheckins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      <div className="px-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <Icon name="clock" size={20} />
              <span className="text-lg font-bold">Check-in Manual</span>
            </div>
            <button
              onClick={() => {
                setNewTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }));
                setNewDate(new Date().toLocaleDateString('pt-BR'));
                setIsCreateOpen(true);
              }}
              className="bg-yellow-300 text-black border-none rounded-xl w-11 h-11 flex items-center justify-center cursor-pointer text-xl font-bold shadow-md"
            >
              +
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {checkins.map((checkin) => (
              <div key={checkin.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-3 text-gray-900">
                      {checkin.time}
                    </div>
                  </div>
                  <div className="text-base text-gray-700 font-medium">
                    {checkin.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/50 cursor-pointer"
            onClick={() => setIsCreateOpen(false)}
            aria-label="Fechar"
          />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-6 h-[90vh] overflow-auto md:inset-y-10 md:mx-auto md:max-w-md md:rounded-2xl md:h-auto animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">Novo Check-in</span>
              <button onClick={() => setIsCreateOpen(false)} className="bg-transparent border-none text-black cursor-pointer">
                <Icon name="x" size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xl font-semibold mb-3">Hora</label>
              <input
                value={newTime}
                onChange={(e: any) => {
                  let v = String(e.target.value || '').replace(/\D/g, '').slice(0, 4);
                  if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2);
                  setNewTime(v);
                }}
                maxLength={5}
                inputMode="numeric"
                placeholder="HH:MM"
                className="w-full p-3 text-xl border border-black rounded-2xl"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xl font-semibold mb-3">Data</label>
              <input
                value={newDate}
                onChange={(e: any) => {
                  let v = String(e.target.value || '').replace(/\D/g, '').slice(0, 8);
                  if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                  else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  setNewDate(v);
                }}
                maxLength={10}
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                className="w-full p-3 text-xl border border-black rounded-2xl"
              />
            </div>

            <button
              onClick={async () => {
                if (!newTime || !newDate) {
                  alert('Preencha hora e data');
                  return;
                }
                try {
                  const studentId = await getCurrentStudentId();
                  const now = new Date();
                  const pad = (n: number) => String(n).padStart(2, '0');
                  const ymd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
                  const hms = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
                  const id = `${studentId}_${ymd}_${hms}`;
                  await setDoc(doc(db, 'checkins', id), {
                    id,
                    studentId,
                    source: 'manual',
                    createdAt: now.toISOString(),
                  });
                  setIsCreateOpen(false);
                  setNewTime('');
                  setNewDate('');
                  await loadCheckins();
                  setTimeout(() => {
                    Toast.show({ icon: 'success', position: 'bottom', duration: 1500, content: <span className="admy-toast-success">Check-in salvo!</span> });
                  }, 10);
                } catch (e: any) {
                  Toast.show({ icon: 'fail', position: 'bottom', content: <span className="admy-toast-error">{e?.message || 'Erro ao salvar check-in'}</span> });
                }
              }}
              className="w-full bg-black text-white rounded-2xl py-4 text-xl font-semibold"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <StatusBar style="auto" />
    </div>
  );
}

