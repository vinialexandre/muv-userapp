import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, Image as RNImage, Text, Pressable, Platform, SafeAreaView } from 'react-native';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Toast, ToastRoot } from './components/ui/ToastAdapter';
import Router from './router';
import CheckinManual from './CheckinManual';
import DadosUsuario from './DadosUsuario';
import DadosPagamento from './DadosPagamento';
import Faturas from './Faturas';
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
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any)?.location?.pathname != null) {
      setCurrentPath((window as any).location.pathname);
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && (Platform.OS !== 'web' || (typeof window !== 'undefined' && (window as any)?.location?.pathname === '/'))) {
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

  if (currentPath === '/dados-pagamento') {
    return <DadosPagamento />;
  }

  if (currentPath === '/faturas') {
    return <Faturas />;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 24, paddingTop: 80 }}>
        <View className="items-center mb-8">
          <RNImage source={require('./assets/logo-muv.png')} style={{ height: 140, width: 140, marginBottom: 16 }} />
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
              {showPw ? <Icon name="eyeOff" size={20} color="#9ca3af" /> : <Icon name="eye" size={20} color="#9ca3af" />}
            </Pressable>
          </View>

          <Button
            block
            loading={loading}
            disabled={loading}
            onClick={submit}
            className="h-16 bg-black rounded-xl flex items-center justify-center"
          >
            <Text className="text-white font-bold text-xl text-center">Entrar</Text>
          </Button>
        </View>
        <StatusBar style="auto" />
        <ToastRoot />
      </View>
    </SafeAreaView>
  );
}
