import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, Image as RNImage, Text, Pressable, Platform } from 'react-native';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Toast, ToastRoot } from './components/ui/ToastAdapter';
import Router from './router';
import CheckinManual from './CheckinManual';
import DadosUsuario from './DadosUsuario';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Icon } from './components/Icon';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    Router.setNavigator(setCurrentPath);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && (typeof window === 'undefined' || window.location.pathname === '/')) {
        Router.navigate('/checkin-manual');
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
      Toast.show({ icon: 'success', content: 'Login realizado' });
      Router.navigate('/checkin-manual');
    } catch (e: any) {
      Toast.show({ icon: 'fail', position: 'bottom', content: mapAuthError(e) });
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    try {
      const emailResolved = await resolveEmail(email);
      await sendPasswordResetEmail(auth, emailResolved);
      Toast.show({ icon: 'success', content: 'Email de recuperação enviado' });
    } catch (e: any) {
      Toast.show({ icon: 'fail', position: 'bottom', content: mapAuthError(e) });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>
      <View className="items-center mb-12">
        <RNImage source={require('./assets/logo-muv.png')} style={{ height: 160, width: 160, marginBottom: 24 }} />
        <Text className="text-5xl font-bold text-gray-900 text-center">Bem-vindo</Text>
      </View>

      <View className="w-96">
          <View className="mb-6">
            <Input
              value={email}
              onChange={setEmail}
              disabled={loading}
              placeholder="Email ou usuário"
              className="w-full h-16 px-6 bg-white border-2 border-black rounded-xl text-lg"
            />
          </View>

          <View className="mb-8 relative">
            <Input
              value={password}
              onChange={setPassword}
              disabled={loading}
              placeholder="Senha"
              type={showPw ? 'text' : 'password'}
              className="w-full h-16 px-6 pr-14 bg-white border-2 border-black rounded-xl text-lg"
            />
            <Pressable
              onPress={() => setShowPw((v) => !v)}
              className="absolute right-4 top-[18px]"
            >
              {showPw ? <Icon name="eyeOff" size={20} className="text-gray-400" /> : <Icon name="eye" size={20} className="text-gray-400" />}
            </Pressable>
          </View>

          <Button
            block
            loading={loading}
            disabled={loading}
            onClick={submit}
            className="h-16 bg-black rounded-xl"
          >
            <Text className="text-white font-bold text-lg">Entrar</Text>
          </Button>
      </View>
      <StatusBar style="auto" />
      <ToastRoot />
    </View>
  );
}
