import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { Icon } from './components/Icon';
import 'antd-mobile/es/global';
import './global.css';

export default function DadosUsuario() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999'
  });

  const logout = () => {
    window.location.href = '/';
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert('Dados salvos com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Header onLogout={logout} />

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
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="user" size={20} />
            <span className="text-xl font-bold">Dados do Usuário</span>
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