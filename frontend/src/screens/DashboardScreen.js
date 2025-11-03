import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Card, Title, Text, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { dashboardAPI } from '../services/api';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [desempenho, setDesempenho] = useState(null);
  const [periodo, setPeriodo] = useState('6');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDesempenho();
  }, [periodo]);

  const carregarDesempenho = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDesempenho(periodo);
      setDesempenho(response.data);
    } catch (error) {
      console.error('Erro ao carregar desempenho:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de desempenho');
    } finally {
      setLoading(false);
    }
  };

  const formatarMesAno = (mesAno) => {
    const [ano, mes] = mesAno.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]}/${ano.slice(2)}`;
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`, // dourado
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#d4af37', // dourado
    },
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>Carregando desempenho...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Filtro de Período */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>📈 Período de Análise</Title>
          <SegmentedButtons
            value={periodo}
            onValueChange={setPeriodo}
            buttons={[
              { value: '3', label: '3 meses' },
              { value: '6', label: '6 meses' },
              { value: '12', label: '1 ano' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Progresso Geral */}
      {desempenho?.progresso_geral && (
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🎯 Progresso Geral</Title>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{desempenho.progresso_geral.total_tarefas}</Text>
                <Text style={styles.statLabel}>Total de Tarefas</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{desempenho.progresso_geral.tarefas_concluidas}</Text>
                <Text style={styles.statLabel}>Concluídas</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {desempenho.progresso_geral.total_tarefas > 0
                    ? Math.round((desempenho.progresso_geral.tarefas_concluidas / desempenho.progresso_geral.total_tarefas) * 100)
                    : 0}
                  %
                </Text>
                <Text style={styles.statLabel}>Taxa de Conclusão</Text>
              </View>

              {desempenho.progresso_geral.media_geral > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{desempenho.progresso_geral.media_geral.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Média Geral</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Gráficos */}
      {desempenho?.historico && desempenho.historico.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>📊 Tarefas Concluídas por Mês</Title>
            <BarChart
              data={{
                labels: desempenho.historico.map((item) => formatarMesAno(item.mes_ano)),
                datasets: [{ data: desempenho.historico.map((item) => item.tarefas_concluidas) }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      {desempenho?.historico && desempenho.historico.some((item) => item.media_notas > 0) && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🎓 Evolução das Notas</Title>
            <LineChart
              data={{
                labels: desempenho.historico.map((item) => formatarMesAno(item.mes_ano)),
                datasets: [{ data: desempenho.historico.map((item) => item.media_notas || 0) }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      {/* Insights */}
      <Card style={styles.insightsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>💡 Insights</Title>

          {desempenho?.progresso_geral && (
            <View style={styles.insightItem}>
              <Text style={styles.insightText}>
                🎯 Sua taxa de conclusão é de{' '}
                {desempenho.progresso_geral.total_tarefas > 0
                  ? Math.round((desempenho.progresso_geral.tarefas_concluidas / desempenho.progresso_geral.total_tarefas) * 100)
                  : 0}
                %
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#d4af37',
  },
  filterCard: {
    margin: 10,
    backgroundColor: '#1E1E1E',
  },
  statsCard: {
    margin: 10,
    backgroundColor: '#1E1E1E',
  },
  chartCard: {
    margin: 10,
    backgroundColor: '#1E1E1E',
  },
  insightsCard: {
    margin: 10,
    backgroundColor: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightItem: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    color: '#f5f5f5',
  },
});
