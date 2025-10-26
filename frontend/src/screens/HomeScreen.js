import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, Button, FAB, ActivityIndicator, Chip } from 'react-native-paper';
import { dashboardAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const usuarioData = await AsyncStorage.getItem('@usuario');
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData));
      }

      const response = await dashboardAPI.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const getProgresso = () => {
    if (!dashboard?.estatisticas) return 0;
    const { total, concluidas } = dashboard.estatisticas;
    return total > 0 ? (concluidas / total) * 100 : 0;
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Boas-vindas */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>
              Olá, {usuario?.nome?.split(' ')[0] || 'Estudante'}! 👋
            </Title>
            <Text style={styles.welcomeSubtitle}>
              Bem-vindo ao seu sistema acadêmico
            </Text>
            
            {dashboard?.estatisticas && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboard.estatisticas.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.statSuccess]}>
                    {dashboard.estatisticas.concluidas}
                  </Text>
                  <Text style={styles.statLabel}>Concluídas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.statWarning]}>
                    {dashboard.estatisticas.pendentes}
                  </Text>
                  <Text style={styles.statLabel}>Pendentes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.statDanger]}>
                    {dashboard.estatisticas.atrasadas}
                  </Text>
                  <Text style={styles.statLabel}>Atrasadas</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tarefas Atrasadas */}
        {dashboard?.tarefas_atrasadas?.length > 0 && (
          <Card style={[styles.sectionCard, styles.urgentCard]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Title style={styles.sectionTitle}>⚠️ Tarefas Atrasadas</Title>
                <Chip mode="outlined" style={styles.urgentChip}>
                  {dashboard.tarefas_atrasadas.length}
                </Chip>
              </View>
              
              {dashboard.tarefas_atrasadas.slice(0, 3).map((tarefa) => (
                <View key={tarefa.id} style={styles.taskItem}>
                  <Text style={styles.taskTitle}>{tarefa.titulo}</Text>
                  <Text style={styles.taskDate}>
                    Venceu: {formatarData(tarefa.data_vencimento)}
                  </Text>
                </View>
              ))}
              
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Tasks', { filtro: 'atrasadas' })}
                style={styles.verTudoButton}
              >
                Ver Todas
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Próximas Tarefas */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>📅 Próximas Tarefas</Title>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Tasks')}
                compact
              >
                Ver Todas
              </Button>
            </View>
            
            {dashboard?.proximas_tarefas?.length > 0 ? (
              dashboard.proximas_tarefas.slice(0, 5).map((tarefa) => (
                <View key={tarefa.id} style={styles.taskItem}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{tarefa.titulo}</Text>
                    <Chip 
                      mode="outlined" 
                      size="small"
                      style={[
                        styles.priorityChip,
                        { backgroundColor: 
                          tarefa.prioridade === 'alta' ? '#f44336' :
                          tarefa.prioridade === 'media' ? '#ff9800' : '#4caf50'
                        }
                      ]}
                      textStyle={styles.chipText}
                    >
                      {tarefa.prioridade}
                    </Chip>
                  </View>
                  <Text style={styles.taskDate}>
                    {formatarData(tarefa.data_vencimento)}
                  </Text>
                  {tarefa.materia && (
                    <Text style={styles.taskMateria}>{tarefa.materia}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma tarefa próxima</Text>
            )}
          </Card.Content>
        </Card>

        {/* Próximos Eventos */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>🗓️ Próximos Eventos</Title>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Calendar')}
                compact
              >
                Ver Calendário
              </Button>
            </View>
            
            {dashboard?.proximos_eventos?.length > 0 ? (
              dashboard.proximos_eventos.slice(0, 3).map((evento) => (
                <View key={evento.id} style={styles.eventItem}>
                  <View style={styles.eventIcon}>
                    <Text>
                      {evento.tipo === 'prova' ? '📝' :
                       evento.tipo === 'aula' ? '📚' :
                       evento.tipo === 'trabalho' ? '📋' : '📅'}
                    </Text>
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{evento.titulo}</Text>
                    <Text style={styles.eventDate}>
                      {formatarData(evento.data_inicio)}
                    </Text>
                    {evento.local && (
                      <Text style={styles.eventLocal}>📍 {evento.local}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum evento próximo</Text>
            )}
          </Card.Content>
        </Card>

        {/* Desempenho */}
        {dashboard?.desempenho_mensal && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>📊 Desempenho do Mês</Title>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProgresso()}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {getProgresso().toFixed(0)}% concluído
                </Text>
              </View>
              
              <View style={styles.performanceStats}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>
                    {dashboard.desempenho_mensal.tarefas_concluidas}
                  </Text>
                  <Text style={styles.performanceLabel}>Concluídas</Text>
                </View>
                
                {dashboard.desempenho_mensal.media_notas > 0 && (
                  <View style={styles.performanceItem}>
                    <Text style={styles.performanceValue}>
                      {dashboard.desempenho_mensal.media_notas.toFixed(1)}
                    </Text>
                    <Text style={styles.performanceLabel}>Média</Text>
                  </View>
                )}
                
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>
                    {dashboard.desempenho_mensal.tempo_estudo_minutos}
                  </Text>
                  <Text style={styles.performanceLabel}>Min. estudo</Text>
                </View>
              </View>
              
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Dashboard')}
                style={styles.verDetalhesButton}
              >
                Ver Detalhes
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm')}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  welcomeCard: {
    margin: 10,
    backgroundColor: '#2196F3',
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 24,
    marginBottom: 5,
  },
  welcomeSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statSuccess: {
    color: '#4CAF50',
  },
  statWarning: {
    color: '#FFC107',
  },
  statDanger: {
    color: '#F44336',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  sectionCard: {
    margin: 10,
    marginTop: 5,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
  },
  urgentChip: {
    backgroundColor: '#F44336',
  },
  taskItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  taskMateria: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  priorityChip: {
    height: 24,
  },
  chipText: {
    color: 'white',
    fontSize: 10,
  },
  eventItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventLocal: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#666',
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  verTudoButton: {
    marginTop: 10,
  },
  verDetalhesButton: {
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});