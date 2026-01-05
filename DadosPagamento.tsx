import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import { Toast, ToastRoot } from './components/ui/ToastAdapter';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import Router from './router';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function DadosPagamento() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'credit_card'>('credit_card');
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    exp: '',
    cvv: ''
  });

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    Router.navigate(path);
  };

  const loadPaymentData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      let qs = await getDocs(query(collection(db, 'students'), where('uid', '==', user.uid)));
      if (qs.empty) qs = await getDocs(query(collection(db, 'students'), where('authUid', '==', user.uid)));
      if (!qs.empty) {
        const sdoc = qs.docs[0];
        setStudentId(sdoc.id);
        const d: any = sdoc.data();
        setPaymentMethod(d.paymentPreference || 'credit_card');
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: any) => {
      if (user) loadPaymentData();
      else Router.navigate('/');
    });
    return () => unsub();
  }, []);



  const onlyDigits = (v: string) => v.replace(/\D/g, '');

  const handleCardInputChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user || !studentId) throw new Error('Usuário não autenticado');

      const payload: any = {
        paymentPreference: paymentMethod,
        updatedAt: serverTimestamp()
      };

      const numDigits = onlyDigits(cardData.number);
      const hasCardData = paymentMethod === 'credit_card' && numDigits.length >= 13;

      if (hasCardData) {
        if (numDigits.length < 13 || numDigits.length > 19) throw new Error('Número do cartão inválido');
        if (!cardData.holder.trim()) throw new Error('Nome do titular obrigatório');
        if (!/^\d{2}\/\d{2}$/.test(cardData.exp)) throw new Error('Validade inválida (use MM/AA)');
        const cvvDigits = onlyDigits(cardData.cvv);
        if (cvvDigits.length < 3 || cvvDigits.length > 4) throw new Error('CVV inválido');

        const tokenRes = await fetch('/api/payment/tokenize-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: cardData.number,
            holder: cardData.holder,
            exp: cardData.exp,
            cvv: cardData.cvv
          })
        });
        const tokenJson = await tokenRes.json();
        if (!tokenRes.ok || !tokenJson.token) {
          throw new Error(tokenJson.error || 'Erro ao tokenizar cartão');
        }

        const updateRes = await fetch('/api/payment/update-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            cardToken: tokenJson.token
          })
        });
        const updateJson = await updateRes.json();
        if (!updateRes.ok || !updateJson.ok) {
          throw new Error(updateJson.error || 'Erro ao atualizar cartão');
        }
      }

      await updateDoc(doc(db, 'students', studentId), payload);

      setTimeout(() => {
        Toast.show({ icon: 'success', position: 'top', duration: 1500, content: hasCardData ? 'Cartão atualizado!' : 'Método de pagamento salvo!' });
        if (hasCardData) {
          setCardData({ number: '', holder: '', exp: '', cvv: '' });
        }
      }, 10);
    } catch (e: any) {
      Toast.show({ icon: 'fail', position: 'top', content: e?.message || 'Erro ao salvar dados' });
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (v: string) => {
    const num = onlyDigits(v);
    return num.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const digits = onlyDigits(v);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View className="flex-1 bg-gray-50 w-full max-[768px]:bg-white">
        <Header onOpenMenu={() => setIsMenuOpen(true)} />

        <Menu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={handleNavigate}
        />

        <View className="flex-1 px-4 pb-6 max-[768px]:px-0 max-[768px]:pb-6">
          <View className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-[768px]:rounded-none max-[768px]:shadow-none max-[768px]:border-0 max-[768px]:mb-6">
            <View className="p-6 max-[768px]:p-5 border-b border-gray-100">
              <View className="flex items-center gap-3 max-[768px]:gap-4 max-[768px]:justify-center">
                <View className="max-[768px]:bg-blue-50 max-[768px]:p-2 max-[768px]:rounded-xl">
                  <Icon name="creditCard" size={20} color="#000" />
                </View>
                <Text className="text-xl font-bold max-[768px]:text-2xl max-[768px]:text-gray-900">Dados de Pagamento</Text>
              </View>
            </View>

            <ScrollView className="flex-1 p-6 max-[768px]:p-5" contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}>
              <View className="flex flex-col gap-6">
                <View>
                  <Text className="text-lg font-bold text-gray-800 mb-4 text-center">Método de Pagamento Preferencial</Text>
                  <View className="flex-row gap-3 flex-wrap">
                    <Pressable
                      onPress={() => setPaymentMethod('pix')}
                      className={`flex-1 min-w-[100px] p-4 border-2 rounded-lg ${paymentMethod === 'pix' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'}`}
                    >
                      <Text className={`text-center font-semibold ${paymentMethod === 'pix' ? 'text-yellow-700' : 'text-gray-700'}`}>Pix</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPaymentMethod('boleto')}
                      className={`flex-1 min-w-[100px] p-4 border-2 rounded-lg ${paymentMethod === 'boleto' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'}`}
                    >
                      <Text className={`text-center font-semibold ${paymentMethod === 'boleto' ? 'text-yellow-700' : 'text-gray-700'}`}>Boleto</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPaymentMethod('credit_card')}
                      className={`flex-1 min-w-[100px] p-4 border-2 rounded-lg ${paymentMethod === 'credit_card' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'}`}
                    >
                      <Text className={`text-center font-semibold ${paymentMethod === 'credit_card' ? 'text-yellow-700' : 'text-gray-700'}`}>Cartão</Text>
                    </Pressable>
                  </View>
                </View>

                {paymentMethod === 'credit_card' && (
                  <View>
                    <Text className="text-lg font-bold text-gray-800 mb-4">Dados do Cartão</Text>
                    <View className="mb-4">
                      <Text className="block text-base font-medium text-gray-700 mb-2">Número do Cartão</Text>
                      <Input
                        value={formatCardNumber(cardData.number)}
                        onChange={(text) => handleCardInputChange('number', onlyDigits(text))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        inputMode="numeric"
                        className="w-full p-4 border border-gray-300 rounded-lg text-base"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="block text-base font-medium text-gray-700 mb-2">Nome no Cartão</Text>
                      <Input
                        value={cardData.holder}
                        onChange={(text) => handleCardInputChange('holder', text.toUpperCase())}
                        placeholder="Nome do titular"
                        className="w-full p-4 border border-gray-300 rounded-lg text-base"
                      />
                    </View>

                    <View className="flex-row gap-4 mb-4">
                      <View className="flex-1">
                        <Text className="block text-base font-medium text-gray-700 mb-2">Validade</Text>
                        <Input
                          value={formatExpiry(cardData.exp)}
                          onChange={(text) => handleCardInputChange('exp', onlyDigits(text))}
                          placeholder="MM/AA"
                          maxLength={5}
                          inputMode="numeric"
                          className="w-full p-4 border border-gray-300 rounded-lg text-base"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="block text-base font-medium text-gray-700 mb-2">CVV</Text>
                        <Input
                          value={cardData.cvv}
                          onChange={(text) => handleCardInputChange('cvv', onlyDigits(text))}
                          placeholder="123"
                          maxLength={4}
                          inputMode="numeric"
                          type="password"
                          className="w-full p-4 border border-gray-300 rounded-lg text-base"
                        />
                      </View>
                    </View>
                  </View>
                )}

                <View className="mt-8">
                  <Button
                    onClick={handleSave}
                    loading={loading}
                    disabled={loading}
                    block
                    className="bg-yellow-300 rounded-lg px-8 py-5 shadow-md"
                  >
                    <Text className="text-black text-xl font-semibold">Salvar</Text>
                  </Button>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        <ToastRoot />
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}
