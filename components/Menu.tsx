import { Icon } from './Icon';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function Menu({ isOpen, onClose, onNavigate }: MenuProps) {
  if (!isOpen) return null;

  const currentPath = window.location.pathname;

  return (
    <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col items-center justify-center animate-slide-right">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-transparent border-none text-white cursor-pointer"
      >
        <Icon name="x" size={28} />
      </button>
      <div className="flex flex-col gap-8 items-center">
        <button
          onClick={() => onNavigate('/dados-usuario')}
          className={`flex items-center gap-4 px-8 py-5 rounded-xl text-white border-none text-xl cursor-pointer ${
            currentPath === '/dados-usuario' ? 'bg-white bg-opacity-10' : 'bg-transparent'
          }`}
        >
          <Icon name="user" size={28} />
          <span>Seus Dados</span>
        </button>
        <button
          onClick={() => onNavigate('/checkin-manual')}
          className={`flex items-center gap-4 px-8 py-5 rounded-xl text-white border-none text-xl cursor-pointer ${
            currentPath === '/checkin-manual' ? 'bg-white bg-opacity-10' : 'bg-transparent'
          }`}
        >
          <Icon name="clock" size={28} />
          <span>Check-in Manual</span>
        </button>
      </div>
      <button
        onClick={async () => { try { await signOut(auth); } finally { window.location.href = '/'; } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-transparent border-none text-white cursor-pointer flex items-center gap-3"
      >
        <span className='text-xl'>Sair</span>
        <Icon name="logOut" size={28} />
      </button>

    </div>
  );
}