import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Salvar item
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
      return false;
    }
  },

  // Buscar item
  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Erro ao ler do storage:', error);
      return null;
    }
  },

  // Remover item
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover do storage:', error);
      return false;
    }
  },

  // Limpar tudo
  clear: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      return false;
    }
  },

  // Multi get
  multiGet: async (keys) => {
    try {
      const values = await AsyncStorage.multiGet(keys);
      return values.reduce((acc, [key, value]) => {
        acc[key] = value ? JSON.parse(value) : null;
        return acc;
      }, {});
    } catch (error) {
      console.error('Erro no multiGet:', error);
      return {};
    }
  },

  // Multi set
  multiSet: async (keyValuePairs) => {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Erro no multiSet:', error);
      return false;
    }
  },

  // Multi remove
  multiRemove: async (keys) => {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Erro no multiRemove:', error);
      return false;
    }
  }
};

// Chaves específicas do app
export const STORAGE_KEYS = {
  TOKEN: '@token',
  USUARIO: '@usuario',
  CONFIGURACOES: '@configuracoes',
  TAREFAS_LOCAIS: '@tarefas_locais'
};