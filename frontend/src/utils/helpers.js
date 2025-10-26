import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

// Formatação de datas
export const formatarData = (data, formato = 'DD/MM/YYYY') => {
  return moment(data).format(formato);
};

export const formatarDataHora = (data, formato = 'DD/MM/YYYY HH:mm') => {
  return moment(data).format(formato);
};

export const formatarDataExtenso = (data) => {
  return moment(data).format('dddd, DD [de] MMMM [de] YYYY');
};

// Cálculo de prazos
export const calcularDiasRestantes = (dataVencimento) => {
  const hoje = moment();
  const vencimento = moment(dataVencimento);
  return vencimento.diff(hoje, 'days');
};

export const isAtrasada = (dataVencimento, status) => {
  if (status === 'concluida') return false;
  return moment(dataVencimento).isBefore(moment());
};

export const getStatusTarefa = (dataVencimento, status) => {
  if (status === 'concluida') return 'concluida';
  if (isAtrasada(dataVencimento, status)) return 'atrasada';
  return status;
};

// Cores e temas
export const getCorPrioridade = (prioridade) => {
  switch (prioridade) {
    case 'alta': return '#f44336';
    case 'media': return '#ff9800';
    case 'baixa': return '#4caf50';
    default: return '#757575';
  }
};

export const getCorStatus = (status) => {
  switch (status) {
    case 'concluida': return '#4caf50';
    case 'em_andamento': return '#2196f3';
    case 'pendente': return '#ff9800';
    case 'atrasada': return '#f44336';
    default: return '#757575';
  }
};

export const getIconeStatus = (status) => {
  switch (status) {
    case 'concluida': return 'check-circle';
    case 'em_andamento': return 'progress-clock';
    case 'pendente': return 'clock-outline';
    case 'atrasada': return 'alert-circle';
    default: return 'help-circle';
  }
};

// Validações
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarSenha = (senha) => {
  return senha.length >= 6;
};

export const validarTelefone = (telefone) => {
  const regex = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
  return regex.test(telefone.replace(/\s/g, ''));
};

// Formatação de números
export const formatarNota = (nota) => {
  if (!nota && nota !== 0) return 'N/A';
  return nota.toFixed(1);
};

export const calcularMedia = (notas) => {
  const notasValidas = notas.filter(nota => nota !== null && nota !== undefined);
  if (notasValidas.length === 0) return 0;
  return notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
};

// Manipulação de arrays
export const agruparPor = (array, chave) => {
  return array.reduce((acc, item) => {
    const key = item[chave];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};

export const ordenarPor = (array, chave, ordem = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = a[chave];
    let bVal = b[chave];

    // Para datas
    if (chave.includes('data')) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (ordem === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
};

// Geradores
export const gerarIdUnico = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const gerarCorAleatoria = () => {
  const cores = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
  return cores[Math.floor(Math.random() * cores.length)];
};

// Helpers de performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};