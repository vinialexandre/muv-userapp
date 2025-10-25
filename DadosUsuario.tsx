import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import { Toast } from './components/ui/ToastAdapter';
import './global.css';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function DadosUsuario() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: ''
  });
  const [studentId, setStudentId] = useState<string | null>(null);


  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };



  const loadStudent = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      let qs = await getDocs(query(collection(db, 'students'), where('uid', '==', user.uid)));
      if (qs.empty) qs = await getDocs(query(collection(db, 'students'), where('authUid', '==', user.uid)));
      if (!qs.empty) {
        const sdoc = qs.docs[0];
        setStudentId(sdoc.id);
        const d: any = sdoc.data();
        setFormData({
          nome: d.name || '',
          cpf: d.cpf != null ? String(d.cpf) : '',
          email: d.email || user.email || '',
          telefone: d.phone != null ? String(d.phone) : (d.whatsapp != null ? String(d.whatsapp) : '')
        });
      } else {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    } catch (e) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: any) => { if (user) loadStudent(); else window.location.href = '/'; });
    return () => unsub();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      const cpfDigits = (formData.cpf || '').replace(/\D/g, '');
      const phoneDigits = (formData.telefone || '').replace(/\D/g, '');
      const cpfNum = cpfDigits ? Number(cpfDigits) : undefined;
      const phoneNum = phoneDigits ? Number(phoneDigits) : undefined;

      const ensureId = async (): Promise<string> => {
        if (studentId) return studentId;
        let qs = await getDocs(query(collection(db, 'students'), where('uid', '==', user.uid)));
        if (qs.empty) qs = await getDocs(query(collection(db, 'students'), where('authUid', '==', user.uid)));
        if (!qs.empty) { setStudentId(qs.docs[0].id); return qs.docs[0].id; }
        const newId = user.uid;
        await setDoc(doc(db, 'students', newId), {
          uid: user.uid,
          authUid: user.uid,
          name: formData.nome || '',
          cpf: cpfNum ?? null,
          email: formData.email || user.email || '',
          phone: phoneNum ?? null,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });
        setStudentId(newId);
        return newId;
      };

      const sid = await ensureId();
      const payload: any = {
        name: formData.nome || '',
        email: formData.email || user.email || '',
        updatedAt: serverTimestamp(),
      };
      if (cpfNum !== undefined) payload.cpf = cpfNum;
      if (phoneNum !== undefined) payload.phone = phoneNum;

      await setDoc(doc(db, 'students', sid), payload, { merge: true });
      Toast.show({ icon: 'success', position: 'bottom', duration: 1500, content: <span className="admy-toast-success">Dados salvos!</span> });
    } catch (e: any) {
      Toast.show({ icon: 'fail', position: 'bottom', content: <span className="admy-toast-error">{e?.message || 'Erro ao salvar dados'}</span> });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full max-[768px]:bg-white max-[768px]:overflow-y-auto pt-24">
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      <div className="px-4 pb-6 max-[768px]:px-0 max-[768px]:pb-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-[768px]:rounded-none max-[768px]:shadow-none max-[768px]:border-0 max-[768px]:min-h-screen">
          {/* Header da seção */}
          <div className="p-6 max-[768px]:p-5 border-b border-gray-100">
            <div className="flex items-center gap-3 max-[768px]:gap-4 max-[768px]:justify-center">
              <div className="max-[768px]:bg-blue-50 max-[768px]:p-2 max-[768px]:rounded-xl">
                <Icon name="user" size={20} className="max-[768px]:text-blue-600" />
              </div>
              <span className="text-xl font-bold max-[768px]:text-2xl max-[768px]:text-gray-900">Seus Dados</span>
            </div>
          </div>

          {/* Formulário */}
          <div className="p-6 max-[768px]:p-5 max-[768px]:flex-1 max-[768px]:overflow-y-auto">
            <div className="flex flex-col gap-4 max-[768px]:gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2 max-[768px]:text-base max-[768px]:font-bold max-[768px]:text-gray-800 max-[768px]:mb-3">Nome Completo</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg max-[768px]:p-4 max-[768px]:text-lg max-[768px]:border-2 max-[768px]:border-gray-300 max-[768px]:rounded-xl max-[768px]:bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2 max-[768px]:text-base max-[768px]:font-bold max-[768px]:text-gray-800 max-[768px]:mb-3">CPF</label>
                <input
                  type="text"
                  value={(() => {
                    const cpf = formData.cpf.replace(/\D/g, '');
                    if (cpf.length <= 11) {
                      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                        .replace(/(\d{3})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4')
                        .replace(/(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3')
                        .replace(/(\d{3})(\d{1,3})$/, '$1.$2');
                    }
                    return formData.cpf;
                  })()} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleInputChange('cpf', value);
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                  className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg max-[768px]:p-4 max-[768px]:text-lg max-[768px]:border-2 max-[768px]:border-gray-300 max-[768px]:rounded-xl max-[768px]:bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2 max-[768px]:text-base max-[768px]:font-bold max-[768px]:text-gray-800 max-[768px]:mb-3">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg max-[768px]:p-4 max-[768px]:text-lg max-[768px]:border-2 max-[768px]:border-gray-300 max-[768px]:rounded-xl max-[768px]:bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2 max-[768px]:text-base max-[768px]:font-bold max-[768px]:text-gray-800 max-[768px]:mb-3">Telefone</label>
                <input
                  type="tel"
                  value={(() => {
                    const phone = formData.telefone.replace(/\D/g, '');
                    if (phone.length === 11) {
                      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    } else if (phone.length === 10) {
                      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    } else if (phone.length > 6) {
                      return phone.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
                    } else if (phone.length > 2) {
                      return phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                    }
                    return phone;
                  })()} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleInputChange('telefone', value);
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  inputMode="numeric"
                  className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg max-[768px]:p-4 max-[768px]:text-lg max-[768px]:border-2 max-[768px]:border-gray-300 max-[768px]:rounded-xl max-[768px]:bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>

              {/* Botão Salvar - Desktop */}
              <div className="mt-8 max-[768px]:hidden">
                <button
                  onClick={handleSave}
                  className="w-full bg-yellow-300 text-black border-none rounded-lg px-8 py-5 text-xl font-semibold cursor-pointer shadow-md hover:bg-yellow-400 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Salvar Fixo - Mobile */}
      <div className="hidden max-[768px]:block fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
        <button
          onClick={handleSave}
          className="w-full bg-yellow-300 text-black border-none rounded-xl py-4 text-xl font-bold shadow-lg hover:bg-yellow-400 transition-colors active:scale-95"
        >
          Salvar
        </button>
      </div>

      <StatusBar style="auto" />
    </div>
  );
}