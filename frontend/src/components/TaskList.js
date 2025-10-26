import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import TaskItem from './TaskItem';

const TaskList = ({ tarefas, loading, onEditTask, onDeleteTask, onRefresh }) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando tarefas...</Text>
      </View>
    );
  }

  if (!tarefas || tarefas.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>📝</Text>
        <Text style={styles.emptyTitle}>Nenhuma tarefa encontrada</Text>
        <Text style={styles.emptySubtext}>
          {onRefresh ? 'Puxe para atualizar' : 'Crie sua primeira tarefa!'}
        </Text>
        {onRefresh && (
          <Button 
            mode="outlined" 
            onPress={onRefresh}
            style={styles.refreshButton}
            icon="refresh"
          >
            Recarregar
          </Button>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={tarefas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TaskItem 
          tarefa={item} 
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    marginTop: 8,
  },
});

export default TaskList;