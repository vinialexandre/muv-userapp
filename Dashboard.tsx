import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import 'antd-mobile/es/global';
import './global.css';

const mockCheckins = [
  { id: 1, time: '08:30', date: '15/01/2024', status: 'PRESENTE' },
  { id: 2, time: '09:15', date: '14/01/2024', status: 'PRESENTE' },
  { id: 3, time: '10:00', date: '13/01/2024', status: 'AUSENTE' },
  { id: 4, time: '11:20', date: '12/01/2024', status: 'PRESENTE' },
];

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logout = () => {
    window.location.href = '/';
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Header onLogout={logout} />

      {/* Menu Button */}
      {!isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed bottom-5 left-5 z-50 bg-black text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer"
        >
          <Icon name="menu" size={24} />
        </button>
      )}

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
          <button className="bg-yellow-300 text-black border-none rounded-xl w-11 h-11 flex items-center justify-center cursor-pointer text-xl font-bold shadow-md">
            +
          </button>
        </div>

        {/* Check-ins List */}
        <div className="flex flex-col gap-4">
          {mockCheckins.map(checkin => (
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

      <StatusBar style="auto" />
    </div>
  );
}