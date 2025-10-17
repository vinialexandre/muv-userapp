import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import 'antd-mobile/es/global';
import './global.css';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function DadosUsuario() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: ''
  });

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };

  const getCurrentStudentId = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    if (user.email) {
      const q = query(collection(db, 'students'), where('email', '==', user.email));
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].id;
    }
    return user.uid;
  };

  const loadStudent = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const studentId = await getCurrentStudentId();
    if (!studentId) return;
    const ref = doc(db, 'students', studentId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d: any = snap.data();
      setFormData({
        nome: d.name || '',
        cpf: d.cpf || '',
        email: d.email || user.email || '',
        telefone: d.phone || d.whatsapp || ''
      });
    }
  };

  useEffect(() => {
    loadStudent();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert('Dados salvos com sucesso!');
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
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="user" size={20} />
            <span className="text-xl font-bold">Seus Dados</span>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>

            <div style={{ marginTop: '32px' }}>
              <button
                onClick={handleSave}
                className="w-full bg-yellow-300 text-black border-none rounded-lg px-8 py-5 text-xl font-semibold cursor-pointer shadow-md hover:bg-yellow-400 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>

      <StatusBar style="auto" />
    </div>
  );
}