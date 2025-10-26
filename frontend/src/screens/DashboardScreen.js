import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Card, Title, Text, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { dashboardAPI } from '../services/api';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

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
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#2196F3'
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
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
                    : 0
                  }%
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

      {/* Gráfico de Tarefas Concluídas */}
      {desempenho?.historico && desempenho.historico.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>📊 Tarefas Concluídas por Mês</Title>
            
            <BarChart
              data={{
                labels: desempenho.historico.map(item => formatarMesAno(item.mes_ano)),
                datasets: [
                  {
                    data: desempenho.historico.map(item => item.tarefas_concluidas),
                  }
                ]
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

      {/* Gráfico de Média de Notas */}
      {desempenho?.historico && desempenho.historico.some(item => item.media_notas > 0) && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🎓 Evolução das Notas</Title>
            
            <LineChart
              data={{
                labels: desempenho.historico.map(item => formatarMesAno(item.mes_ano)),
                datasets: [
                  {
                    data: desempenho.historico.map(item => item.media_notas || 0),
                  }
                ]
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

      {/* Estatísticas Detalhadas */}
      {desempenho?.historico && (
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>📋 Detalhes por Mês</Title>
            
            {desempenho.historico.map((item, index) => (
              <View key={item.mes_ano} style={styles.monthItem}>
                <View style={styles.monthHeader}>
                  <Text style={styles.monthName}>{formatarMesAno(item.mes_ano)}</Text>
                  <Text style={styles.completionRate}>
                    {Math.round((item.tarefas_concluidas / item.total_tarefas) * 100)}%
                  </Text>
                </View>
                
                <View style={styles.monthStats}>
                  <Text style={styles.monthStat}>
                    ✅ {item.tarefas_concluidas}/{item.total_tarefas} concluídas
                  </Text>
                  
                  {item.tarefas_atrasadas > 0 && (
                    <Text style={styles.monthStat}>
                      ⚠️ {item.tarefas_atrasadas} atrasadas
                    </Text>
                  )}
                  
                  {item.media_notas > 0 && (
                    <Text style={styles.monthStat}>
                      📝 Média: {item.media_notas.toFixed(1)}
                    </Text>
                  )}
                  
                  {item.tempo_estudo_minutos > 0 && (
                    <Text style={styles.monthStat}>
                      ⏱️ {Math.round(item.tempo_estudo_minutos / 60)}h estudadas
                    </Text>
                  )}
                </View>
                
                {index < desempenho.historico.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
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
                  : 0
                }%
              </Text>
            </View>
          )}
          
          {desempenho?.historico && desempenho.historico.length > 1 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightText}>
                📈 Seu desempenho está{' '}
                {desempenho.historico[0].tarefas_concluidas > desempenho.historico[1].tarefas_concluidas 
                  ? 'melhorando' : 'estável'
                } em relação ao mês anterior
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
  filterCard: {
    margin: 10,
  },
  statsCard: {
    margin: 10,
    marginTop: 5,
  },
  chartCard: {
    margin: 10,
    marginTop: 5,
  },
  detailsCard: {
    margin: 10,
    marginTop: 5,
  },
  insightsCard: {
    margin: 10,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  monthItem: {
    marginBottom: 15,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  monthStats: {
    marginLeft: 10,
  },
  monthStat: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 10,
  },
  insightItem: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    color: '#1976d2',
  },
});