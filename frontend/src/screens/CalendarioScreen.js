import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { Card, Title, Text, Button, FAB, Portal, Modal, TextInput, SegmentedButtons } from 'react-native-paper';
import { dashboardAPI } from '../services/api';
import moment from 'moment';

export default function CalendarScreen() {
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Novo evento
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'evento',
    local: ''
  });

  useEffect(() => {
    carregarCalendario();
  }, []);

  const carregarCalendario = async () => {
    try {
      setLoading(true);
      const dataInicio = moment().startOf('month').format('YYYY-MM-DD');
      const dataFim = moment().add(2, 'months').endOf('month').format('YYYY-MM-DD');
      
      const response = await dashboardAPI.getCalendario(dataInicio, dataFim);
      
      
      const eventosProcessados = {};
      
      // Processar eventos
      response.data.eventos.forEach(evento => {
        const data = moment(evento.data_inicio).format('YYYY-MM-DD');
        if (!eventosProcessados[data]) {
          eventosProcessados[data] = { marked: true, dots: [] };
        }
        
        eventosProcessados[data].dots.push({
          color: getEventColor(evento.tipo),
          key: `evento-${evento.id}`
        });
      });
      
      // Processar tarefas
      response.data.tarefas.forEach(tarefa => {
        const data = moment(tarefa.data_vencimento).format('YYYY-MM-DD');
        if (!eventosProcessados[data]) {
          eventosProcessados[data] = { marked: true, dots: [] };
        }
        
        eventosProcessados[data].dots.push({
          color: getTaskColor(tarefa.prioridade, tarefa.status),
          key: `tarefa-${tarefa.id}`
        });
      });
      
      setEvents(eventosProcessados);
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
      Alert.alert('Erro', 'Não foi possível carregar o calendário');
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (tipo) => {
    switch (tipo) {
      case 'prova': return '#f44336';
      case 'aula': return '#2196f3';
      case 'trabalho': return '#ff9800';
      case 'evento': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getTaskColor = (prioridade, status) => {
    if (status === 'concluida') return '#4caf50';
    
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleCreateEvent = async () => {
    if (!novoEvento.titulo || !novoEvento.data_inicio) {
      Alert.alert('Erro', 'Preencha pelo menos o título e data de início');
      return;
    }

    try {
      setLoading(true);
      await dashboardAPI.criarEvento(novoEvento);
      
      setShowEventModal(false);
      setNovoEvento({
        titulo: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        tipo: 'evento',
        local: ''
      });
      
      carregarCalendario();
      Alert.alert('Sucesso', 'Evento criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o evento');
    } finally {
      setLoading(false);
    }
  };

  const getEventsForSelectedDate = () => {
    // Em uma implementação real, você buscaria os eventos específicos da data
    return [
      {
        id: 1,
        titulo: 'Evento de Exemplo',
        tipo: 'evento',
        data_inicio: `${selectedDate} 10:00:00`,
        local: 'Sala 101'
      }
    ];
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={events}
        onDayPress={handleDayPress}
        monthFormat={'MMMM yyyy'}
        hideArrows={false}
        firstDay={1}
        hideDayNames={false}
        showWeekNumbers={false}
        onPressArrowLeft={subtractMonth => subtractMonth()}
        onPressArrowRight={addMonth => addMonth()}
        enableSwipeMonths={true}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#f5b400',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#f5b400',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#f5b400',
          selectedDotColor: '#ffffff',
          arrowColor: '#f5b400',
          monthTextColor: '#f5b400',
          indicatorColor: '#f5b400',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16
        }}
      />

      {/* Eventos do Dia Selecionado */}
      <Card style={styles.eventsCard}>
        <Card.Content>
          <Title style={styles.eventsTitle}>
            Eventos - {moment(selectedDate).format('DD/MM/YYYY')}
          </Title>
          
          <ScrollView style={styles.eventsList}>
            {getEventsForSelectedDate().length > 0 ? (
              getEventsForSelectedDate().map(evento => (
                <View key={evento.id} style={styles.eventItem}>
                  <View style={[styles.eventDot, { backgroundColor: getEventColor(evento.tipo) }]} />
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{evento.titulo}</Text>
                    <Text style={styles.eventTime}>
                      {moment(evento.data_inicio).format('HH:mm')}
                      {evento.local && ` • ${evento.local}`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>Nenhum evento para esta data</Text>
            )}
          </ScrollView>
        </Card.Content>
      </Card>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowEventModal(true)}
        label="Novo Evento"
      />

      {/* Modal Novo Evento */}
<Portal>
  <Modal
    visible={showEventModal}
    onDismiss={() => setShowEventModal(false)}
    contentContainerStyle={styles.modal}
  >
    <ScrollView>
      <Card>
        <Card.Content>
          <Title style={styles.modalTitle}>Criar Novo Evento</Title>
          
          <TextInput
            label="Título do Evento *"
            value={novoEvento.titulo}
            onChangeText={text => setNovoEvento({...novoEvento, titulo: text})}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: '#f5b400' } }}
          />

          <TextInput
            label="Descrição"
            value={novoEvento.descricao}
            onChangeText={text => setNovoEvento({...novoEvento, descricao: text})}
            style={styles.input}
            mode="outlined"
            multiline
            theme={{ colors: { primary: '#f5b400' } }}
          />

          <Text style={styles.label}>Tipo de Evento</Text>
          <SegmentedButtons
            value={novoEvento.tipo}
            onValueChange={value => setNovoEvento({...novoEvento, tipo: value})}
            buttons={[
              { value: 'aula', label: 'Aula', icon: 'school' },
              { value: 'prova', label: 'Prova', icon: 'file-document' },
              { value: 'trabalho', label: 'Trabalho', icon: 'briefcase' },
              { value: 'evento', label: 'Evento', icon: 'calendar' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            label="Data de Início *"
            value={novoEvento.data_inicio}
            onChangeText={text => setNovoEvento({...novoEvento, data_inicio: text})}
            style={styles.input}
            mode="outlined"
            placeholder="YYYY-MM-DD HH:MM:SS"
            theme={{ colors: { primary: '#f5b400' } }}
          />

          <TextInput
            label="Data de Fim"
            value={novoEvento.data_fim}
            onChangeText={text => setNovoEvento({...novoEvento, data_fim: text})}
            style={styles.input}
            mode="outlined"
            placeholder="YYYY-MM-DD HH:MM:SS"
            theme={{ colors: { primary: '#f5b400' } }}
          />

          <TextInput
            label="Local"
            value={novoEvento.local}
            onChangeText={text => setNovoEvento({...novoEvento, local: text})}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: '#f5b400' } }}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowEventModal(false)}
              style={[styles.modalButton, styles.modalButtonOutlined]}
              textColor="#f5b400"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateEvent}
              loading={loading}
              disabled={loading}
              style={[styles.modalButton, styles.modalButtonContained]}
              textColor="#000"
            >
              Criar Evento
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  </Modal>
</Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  eventsCard: {
    margin: 10,
    flex: 1,
  },
  eventsTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  eventsList: {
    maxHeight: 200,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#f5b400',
  },
  modal: {
    margin: 20,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    borderColor: '#f5b400',
    borderWidth: 1,
  },
  input: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f5b400',
  },
  segmented: {
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 0.48,
  },
  modalButtonOutlined: {
    borderColor: '#f5b400',
  },
  modalButtonContained: {
    backgroundColor: '#f5b400',
  },
  modalTitle: {
    color: '#f5b400',
    marginBottom: 10,
  },
});
