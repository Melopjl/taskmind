import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator, Button, Card, IconButton } from 'react-native-paper';

const TaskList = ({ tarefas, loading, onEditTask, onDeleteTask, onRefresh }) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" animating color="#2196F3" />
        <Text style={styles.loadingText}>Carregando tarefas...</Text>
      </View>
    );
  }

  if (!tarefas || tarefas.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📝</Text>
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

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { borderLeftColor: item.cor || '#2196F3' }]}>
      <Card.Title 
        title={item.titulo}
        subtitle={`${item.materia || 'Sem matéria'} • ${item.prioridade || 'Média'}`}
        right={(props) => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              {...props}
              icon="pencil"
              onPress={() => onEditTask && onEditTask(item)}
            />
            <IconButton
              {...props}
              icon="delete"
              onPress={() => onDeleteTask && onDeleteTask(item.id)}
            />
          </View>
        )}
      />
      {item.descricao ? (
        <Card.Content>
          <Text style={styles.descricao}>{item.descricao}</Text>
        </Card.Content>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.date}>
          {item.data_vencimento ? `📅 ${item.data_vencimento}` : ''}
        </Text>
        {item.status === 'concluida' && (
          <Text style={styles.done}>✅ Concluída</Text>
        )}
      </View>
    </Card>
  );

  return (
    <FlatList
      data={tarefas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshing={false}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    borderLeftWidth: 5,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  descricao: {
    color: '#333',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  done: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  refreshButton: {
    marginTop: 16,
  },
});

export default TaskList;
