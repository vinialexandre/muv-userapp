import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import { Popup } from './components/ui/Popup';

import './global.css';

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
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      <div className="px-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-full">
        {/* Header with Title and Add Button */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Icon name="clock" size={20} />
            <span className="text-lg font-bold">Check-in Manual</span>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="bg-yellow-300 text-black border-none rounded-xl w-11 h-11 flex items-center justify-center cursor-pointer text-xl font-bold shadow-md">
            +
          </button>
        </div>

        {/* Check-ins List */}
        <div className="flex flex-col gap-4">
          {checkins.map(checkin => (
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
      <Popup
        visible={isCreateOpen}
        onMaskClick={() => setIsCreateOpen(false)}
        position="bottom"
        bodyStyle={{ height: '90vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'auto' }}
      >
        <div className="w-full p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">Novo Check-in</span>
            <button onClick={() => setIsCreateOpen(false)} className="bg-transparent border-none text-black cursor-pointer">
              <Icon name="x" size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hora</label>
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
              className="w-full p-3 border border-black rounded-lg"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Data</label>
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
              className="w-full p-3 border border-black rounded-lg"
            />
          </div>
          <button
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
            className="w-full bg-black text-white rounded-lg py-3"
          >
            Salvar
          </button>
        </div>
      </Popup>


      <StatusBar style="auto" />
    </div>
  );
}