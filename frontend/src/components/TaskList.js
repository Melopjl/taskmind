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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    color: '#000000ff', 
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f5b400', 
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTimeButton: {
    flex: 0.48,
    borderColor: '#f5b400', 
    borderWidth: 1,
  },
  selectedDateTime: {
    textAlign: 'center',
    color: '#f5b400', 
    marginBottom: 16,
    fontStyle: 'italic',
  },
  segmented: {
    marginBottom: 16,
  },
  selectedButton: {
    backgroundColor: '#f5b400', 
    color: '#fff', 
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 0.48,
    borderColor: '#f5b400', // para outlined buttons
    borderWidth: 1,
  },
  pickerModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
});

export default TaskList;