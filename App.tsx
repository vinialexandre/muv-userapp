import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, Image as RNImage } from 'react-native';
import { Button, Input, Toast } from 'antd-mobile';
import { EyeOutline, EyeInvisibleOutline } from 'antd-mobile-icons';
import 'antd-mobile/es/global';
import './global.css';
import CheckinManual from './CheckinManual';
import DadosUsuario from './DadosUsuario';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && window.location.pathname === '/') {
        window.location.replace('/checkin-manual');
      }
    });
    return () => unsub();
  }, []);

  if (currentPath === '/checkin-manual') {
    return <CheckinManual />;
  }

  if (currentPath === '/dados-usuario') {
    return <DadosUsuario />;
  }

  const mapAuthError = (e: any) => {
    const code = e?.code || '';
    if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) return 'Credenciais inválidas';
    if (code.includes('auth/user-not-found')) return 'Usuário não encontrado';
    if (code.includes('auth/invalid-email')) return 'E-mail inválido';
    if (code.includes('auth/too-many-requests')) return 'Muitas tentativas, tente novamente mais tarde';
    return 'Erro ao autenticar';
  };

  const resolveEmail = async (input: string) => {
    if (!input) throw new Error('Informe seu email ou usuário');
    if (input.includes('@')) return input;
    const snap = await getDoc(doc(db, 'usernames', input));
    if (!snap.exists()) throw new Error('Usuário não encontrado');
    const data = snap.data() as { email?: string };
    if (!data?.email) throw new Error('Usuário sem email associado');
    return data.email;
  };

  const submit = async () => {
    try {
      setLoading(true);
      const emailResolved = await resolveEmail(email);
      await signInWithEmailAndPassword(auth, emailResolved, password);
      Toast.show({ icon: 'success', content: <span className="admy-toast-success">Login realizado</span> });
      window.location.href = '/checkin-manual';
    } catch (e: any) {
      Toast.show({ icon: 'fail', position: 'bottom', content: <span className="admy-toast-error">{mapAuthError(e)}</span> });
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    try {
      const emailResolved = await resolveEmail(email);
      await sendPasswordResetEmail(auth, emailResolved);
      Toast.show({ icon: 'success', content: <span className="admy-toast-success">Email de recuperação enviado</span> });
    } catch (e: any) {
      Toast.show({ icon: 'fail', position: 'bottom', content: <span className="admy-toast-error">{mapAuthError(e)}</span> });
    }
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
