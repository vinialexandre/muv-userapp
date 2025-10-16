import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, Image as RNImage } from 'react-native';
import { Button, Card, Input, Space, Toast } from 'antd-mobile';
import { EyeOutline, EyeInvisibleOutline } from 'antd-mobile-icons';
import 'antd-mobile/es/global';
import './global.css';
import Dashboard from './Dashboard';
import DadosUsuario from './DadosUsuario';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  if (currentPath === '/dashboard') {
    return <Dashboard />;
  }

  if (currentPath === '/dados-usuario') {
    return <DadosUsuario />;
  }

  const submit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    Toast.show({ icon: 'success', content: 'Login mockado concluído. Bem-vindo!' });
    setLoading(false);
    // Redirecionar para dashboard
    window.location.href = '/dashboard';
  };

  const forgot = async () => {
    if (!email) {
      Toast.show({ icon: 'fail', content: 'Informe seu email ou usuário' });
      return;
    }
    Toast.show({ icon: 'success', content: 'Email de recuperação enviado (mock).' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <RNImage source={require('./assets/logo-muv.png')} style={{ height: 160, width: 160, marginBottom: 16 }} />
        <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>Bem-vindo</h1>
      </div>
      
      <div style={{ width: '100%', maxWidth: 384 }}>
          <div className="mb-4">
            <Input
              value={email}
              onChange={setEmail}
              disabled={loading}
              placeholder="Email ou usuário"
              className="w-full h-12 px-4 bg-white border border-black rounded-xl text-base"
            />
          </div>
          
          <div className="mb-6 relative">
            <Input
              value={password}
              onChange={setPassword}
              disabled={loading}
              placeholder="Senha"
              type={showPw ? 'text' : 'password'}
              className="w-full h-12 px-4 pr-12 bg-white border border-black rounded-xl text-base"
            />
            <button
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              type="button"
            >
              {showPw ? <EyeInvisibleOutline className="text-xl" /> : <EyeOutline className="text-xl" />}
            </button>
          </div>
          
          <Button
            block
            loading={loading}
            disabled={loading}
            onClick={submit}
            className="h-12 bg-black text-white rounded-xl font-medium text-base mb-4"
          >
            Entrar
          </Button>
          
        <div className="text-center">
          <button
            type="button"
            onClick={forgot}
            disabled={loading}
            className="text-gray-500 text-sm"
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>
      <StatusBar style="auto" />
    </View>
  );
}
