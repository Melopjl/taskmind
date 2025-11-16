import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// MUDE PARA SEU IP: http://SEU_IP:3000/api
const API_URL = 'seuipdamaquina/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Interceptor para token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Erro ao buscar token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.multiRemove(['@token', '@usuario']);
    }
    return Promise.reject(error);
  }
);

// API de Autenticação
export const authAPI = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  registrar: (dados) => api.post('/auth/registrar', dados),
  recuperarSenha: (email) => api.post('/auth/recuperar-senha', { email }),
  redefinirSenha: (token, novaSenha) => api.post('/auth/redefinir-senha', { token, novaSenha }),
};

// API de Tarefas
export const tasksAPI = {
  getTarefas: (filtros = {}) => api.get('/tarefas', { params: filtros }),
  criarTarefa: (dados) => api.post('/tarefas', dados),
  atualizarTarefa: (id, dados) => api.put(`/tarefas/${id}`, dados),
  excluirTarefa: (id) => api.delete(`/tarefas/${id}`),
  marcarConcluida: (id, nota) => api.patch(`/tarefas/${id}/concluir`, { nota }),
};

// API de Usuário
export const userAPI = {
  getPerfil: () => api.get('/usuario/perfil'),
  atualizarPerfil: (dados) => api.put('/usuario/perfil', dados),
  uploadFoto: (formData) =>
    api.post('/usuario/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removerFoto: () => api.delete('/usuario/foto'), // ✅ método adicionado
  alterarSenha: (dados) => api.put('/usuario/senha', dados),
};

// API de Dashboard
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getCalendario: (dataInicio, dataFim) =>
    api.get('/dashboard/calendario', { params: { data_inicio: dataInicio, data_fim: dataFim } }),
  criarEvento: (dados) => api.post('/dashboard/calendario', dados),
  getDesempenho: (meses = 6) => api.get('/dashboard/desempenho', { params: { meses } }),
};

export default api;
