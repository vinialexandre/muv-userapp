import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import { Toast, ToastRoot } from './components/ui/ToastAdapter';
import Router from './router';
import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const API_URL = 'https://www.muvplataforma.com.br';

const STATUS_MAP = {
  paid: { label: 'Pago', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  canceled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
  failed: { label: 'Falhou', color: 'bg-red-100 text-red-700' }
} as const;

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '-';

export default function Faturas() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);

  const handleNavigate = useCallback((path: string) => {
    setIsMenuOpen(false);
    Router.navigate(path);
  }, []);

  const loadInvoices = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);

      const q = query(collection(db, 'students'), where('uid', '==', user.uid));
      let qs = await getDocs(q);

      if (qs.empty) {
        const q2 = query(collection(db, 'students'), where('authUid', '==', user.uid));
        qs = await getDocs(q2);
      }

      if (!qs.empty) {
        const sid = qs.docs[0].id;
        const res = await fetch(`${API_URL}/api/students/${sid}/subscription/invoices`);

        if (res.ok) {
          const json = await res.json();
          setInvoices(json?.invoices || []);
        }
      }
    } catch (e) {
      Toast.show({ icon: 'fail', position: 'top', content: 'Erro ao carregar faturas' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) loadInvoices();
      else Router.navigate('/');
    });
    return unsub;
  }, [loadInvoices]);

  const renderInvoice = useCallback((invoice: any) => {
    const status = STATUS_MAP[invoice.status as keyof typeof STATUS_MAP] ||
      { label: invoice.status, color: 'bg-gray-100 text-gray-700' };

    return (
      <Pressable
        key={invoice.id}
        className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm active:bg-gray-100"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-1">Fatura</Text>
            <Text className="font-semibold text-base text-gray-900">
              {invoice.id.slice(0, 16)}...
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${status.color}`}>
            <Text className="text-xs font-semibold">{status.label}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm text-gray-500">Vencimento</Text>
            <Text className="font-medium text-gray-900">{formatDate(invoice.due_at)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm text-gray-500">Valor</Text>
            <Text className="font-bold text-lg text-gray-900">{formatCurrency(invoice.amount)}</Text>
          </View>
        </View>
      </Pressable>
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View className="flex-1 bg-gray-50 w-full max-[768px]:bg-white">
        <Header onOpenMenu={() => setIsMenuOpen(true)} />
        <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={handleNavigate} />

        <View className="flex-1 px-4 pb-6 max-[768px]:px-0 max-[768px]:pb-6">
          <View className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-[768px]:rounded-none max-[768px]:shadow-none max-[768px]:border-0 max-[768px]:mb-6">
            <View className="p-6 max-[768px]:p-5 border-b border-gray-100">
              <View className="flex items-center gap-3 max-[768px]:gap-4 max-[768px]:justify-center">
                <View className="max-[768px]:bg-blue-50 max-[768px]:p-2 max-[768px]:rounded-xl">
                  <Icon name="fileText" size={20} color="#000" />
                </View>
                <Text className="text-xl font-bold max-[768px]:text-2xl max-[768px]:text-gray-900">Minhas Faturas</Text>
              </View>
            </View>

            <ScrollView className="flex-1 p-6 max-[768px]:p-5" contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}>
              {loading ? (
                <View className="flex items-center justify-center py-12">
                  <Text className="text-gray-500">Carregando faturas...</Text>
                </View>
              ) : invoices.length === 0 ? (
                <View className="flex items-center justify-center py-12">
                  <Text className="text-gray-500 text-center">Nenhuma fatura encontrada</Text>
                </View>
              ) : (
                <View className="flex flex-col gap-4">
                  {invoices.map(renderInvoice)}
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        <ToastRoot />
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}
