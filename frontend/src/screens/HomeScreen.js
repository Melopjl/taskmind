import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, Button, FAB, ActivityIndicator, Chip } from 'react-native-paper';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      if (usuarioData) setUsuario(JSON.parse(usuarioData));

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f5b400" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f5b400']} />
        }
      >
        {/*Boas-vindas */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>
              Olá, {usuario?.nome?.split(' ')[0] || 'Estudante'} 👋
            </Title>
            <Text style={styles.welcomeSubtitle}>
              Bem-vindo de volta ao seu espaço de foco
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

        <View style={styles.shortcutsContainer}>
          {/* Botão de Tarefas */}
          <RNTouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Tasks')}
            style={styles.shortcutWrapper}
          >
            <LinearGradient
              colors={['#f5b400', '#ffcc33']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.shortcutCard}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={34} color="#000" />
              <Text style={styles.shortcutTitle}>Tarefas</Text>
              <Text style={styles.shortcutSubtitle}>Ver e gerenciar tarefas</Text>
            </LinearGradient>
          </RNTouchableOpacity>

          {/* Botão de Eventos */}
          <RNTouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Calendar')}
            style={styles.shortcutWrapper}
          >
            <LinearGradient
              colors={['#4caf50', '#81c784']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.shortcutCard}
            >
              <MaterialCommunityIcons name="calendar-month" size={34} color="#fff" />
              <Text style={[styles.shortcutTitle, { color: '#fff' }]}>Calendário</Text>
              <Text style={[styles.shortcutSubtitle, { color: '#f0f0f0' }]}>
                Próximos eventos e provas
              </Text>
            </LinearGradient>
          </RNTouchableOpacity>
        </View>

        {/* Desempenho */}
        {dashboard?.desempenho_mensal && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>📊 Desempenho do Mês</Title>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${getProgresso()}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {getProgresso().toFixed(0)}% concluído
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
  welcomeCard: {
    margin: 10,
    backgroundColor: '#f5b400',
    borderRadius: 16,
  },
  welcomeTitle: {
    color: '#000',
    fontSize: 22,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    color: '#333',
    marginBottom: 10,
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
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statSuccess: { color: '#4CAF50' },
  statWarning: { color: '#f5b400' },
  statDanger: { color: '#f44336' },
  statLabel: { color: '#333', fontSize: 12 },

  shortcutsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  shortcutWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  shortcutCard: {
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  shortcutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  shortcutSubtitle: {
    fontSize: 12,
    color: '#222',
    marginTop: 3,
  },

  sectionCard: {
    margin: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  progressContainer: { marginVertical: 10 },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#f5b400' },
  progressText: { textAlign: 'center', marginTop: 5, color: '#666' },
});

