import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Appbar, Searchbar, FAB, Menu, Chip, ActivityIndicator } from 'react-native-paper';
import { tasksAPI } from '../services/api';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

export default function TaskScreen({ navigation, route }) {
  const [tarefas, setTarefas] = useState([]);
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);

  useEffect(() => {
    carregarTarefas();
  }, []);

  useEffect(() => {
    filtrarTarefas();
  }, [tarefas, searchQuery, filtroStatus, filtroPrioridade]);

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTarefas();
      setTarefas(response.data.tarefas);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarTarefas = () => {
    let filtradas = tarefas;

    // Filtro de busca
    if (searchQuery) {
      filtradas = filtradas.filter(tarefa =>
        tarefa.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tarefa.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tarefa.materia?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro de status
    if (filtroStatus !== 'todos') {
      filtradas = filtradas.filter(tarefa => tarefa.status === filtroStatus);
    }

    // Filtro de prioridade
    if (filtroPrioridade !== 'todos') {
      filtradas = filtradas.filter(tarefa => tarefa.prioridade === filtroPrioridade);
    }

    setTarefasFiltradas(filtradas);
  };

  const handleDeleteTask = (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => excluirTarefa(id)
        }
      ]
    );
  };

  const excluirTarefa = async (id) => {
    try {
      await tasksAPI.excluirTarefa(id);
      setTarefas(tarefas.filter(t => t.id !== id));
      Alert.alert('Sucesso', 'Tarefa excluída com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir a tarefa');
    }
  };

  const handleEditTask = (tarefa) => {
    setTarefaEditando(tarefa);
    setShowForm(true);
  };

  const handleSaveTask = async (dadosTarefa) => {
    try {
      if (tarefaEditando) {
        await tasksAPI.atualizarTarefa(tarefaEditando.id, dadosTarefa);
        Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
      } else {
        await tasksAPI.criarTarefa(dadosTarefa);
        Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
      }
      
      setShowForm(false);
      setTarefaEditando(null);
      carregarTarefas();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a tarefa');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setTarefaEditando(null);
  };

  const limparFiltros = () => {
    setFiltroStatus('todos');
    setFiltroPrioridade('todos');
    setSearchQuery('');
  };

  if (showForm) {
    return (
      <TaskForm
        tarefa={tarefaEditando}
        onSave={handleSaveTask}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Minhas Tarefas" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="filter-variant" 
              onPress={() => setMenuVisible(true)} 
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setFiltroStatus('todos');
              setMenuVisible(false);
            }} 
            title="Todos os status" 
          />
          <Menu.Item 
            onPress={() => {
              setFiltroStatus('pendente');
              setMenuVisible(false);
            }} 
            title="Apenas pendentes" 
          />
          <Menu.Item 
            onPress={() => {
              setFiltroStatus('em_andamento');
              setMenuVisible(false);
            }} 
            title="Em andamento" 
          />
          <Menu.Item 
            onPress={() => {
              setFiltroStatus('concluida');
              setMenuVisible(false);
            }} 
            title="Concluídas" 
          />
        </Menu>
      </Appbar.Header>

      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar tarefas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Filtros Ativos */}
      <View style={styles.filtersContainer}>
        <Chip
          selected={filtroStatus !== 'todos'}
          onPress={() => setFiltroStatus('todos')}
          style={styles.chip}
        >
          Status: {filtroStatus === 'todos' ? 'Todos' : filtroStatus}
        </Chip>
        
        <Chip
          selected={filtroPrioridade !== 'todos'}
          onPress={() => setFiltroPrioridade('todos')}
          style={styles.chip}
        >
          Prioridade: {filtroPrioridade === 'todos' ? 'Todas' : filtroPrioridade}
        </Chip>

        {(filtroStatus !== 'todos' || filtroPrioridade !== 'todos' || searchQuery) && (
          <Chip
            onPress={limparFiltros}
            style={[styles.chip, styles.clearChip]}
            icon="close"
          >
            Limpar
          </Chip>
        )}
      </View>

      {/* Lista de Tarefas */}
      <TaskList
        tarefas={tarefasFiltradas}
        loading={loading}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowForm(true)}
        label="Nova Tarefa"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  searchbar: {
    elevation: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: 'white',
  },
  chip: {
    margin: 2,
  },
  clearChip: {
    backgroundColor: '#ffebee',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});