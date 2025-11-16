import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarioScreen() {

  // **Define o dia atual automaticamente**
  const today = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([
    { id: '1', date: '2025-11-08', title: 'Reunião com equipe', desc: 'Discutir metas do mês', prioridade: 'alta' },
    { id: '2', date: '2025-11-09', title: 'Entrega de projeto', desc: 'Prazo final da sprint', prioridade: 'média' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrioridade, setNewPrioridade] = useState('baixa');

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleAddPress = () => {
    setEditingEvent(null);
    setNewTitle('');
    setNewDesc('');
    setNewPrioridade('baixa');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (editingEvent) {
      setEvents(events.map(e =>
        e.id === editingEvent.id
          ? { ...e, title: newTitle, desc: newDesc, prioridade: newPrioridade }
          : e
      ));
    } else {
      const novo = {
        id: Date.now().toString(),
        date: selectedDate,
        title: newTitle,
        desc: newDesc,
        prioridade: newPrioridade,
      };
      setEvents([...events, novo]);
    }
    setModalVisible(false);
  };

  const handleEdit = (item) => {
    setEditingEvent(item);
    setNewTitle(item.title);
    setNewDesc(item.desc);
    setNewPrioridade(item.prioridade);
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    setEvents(events.filter(e => e.id !== item.id));
  };

  const getColorByPriority = (p) => {
    switch (p) {
      case 'alta': return '#e53935';
      case 'média': return '#f5b400';
      case 'baixa': return '#4caf50';
      default: return '#2196f3';
    }
  };

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: getColorByPriority(event.prioridade),
    };
    return acc;
  }, {});

  // Marca o dia selecionado também
  markedDates[selectedDate] = {
    selected: true,
    selectedColor: '#f5b400',
    marked: markedDates[selectedDate]?.marked,
    dotColor: markedDates[selectedDate]?.dotColor,
  };

  const eventsOfDay = events.filter(e => e.date === selectedDate);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#f5b400',
          arrowColor: '#f5b400',
          selectedDayBackgroundColor: '#f5b400',
        }}
      />

      <View style={{ padding: 15, flex: 1 }}>
        {eventsOfDay.length === 0 ? (
          <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>
            Nenhum evento neste dia.
          </Text>
        ) : (
          <FlatList
            data={eventsOfDay}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: getColorByPriority(item.prioridade) }
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDesc}>{item.desc}</Text>
                  <Text style={styles.priorityLabel}>Prioridade: {item.prioridade}</Text>
                </View>

                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={20} color="#555" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons name="trash" size={20} color="#e53935" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* BOTÃO FLUTUANTE SEM CONDIÇÃO */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descrição"
              multiline
              value={newDesc}
              onChangeText={setNewDesc}
            />

            <Text style={styles.label}>Prioridade:</Text>

            <View style={styles.priorityRow}>
              {['baixa', 'média', 'alta'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    {
                      backgroundColor: newPrioridade === p ? getColorByPriority(p) : '#eee'
                    }
                  ]}
                  onPress={() => setNewPrioridade(p)}
                >
                  <Text style={{ color: newPrioridade === p ? '#fff' : '#333', fontWeight: 'bold' }}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.btnText}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f5b400',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  eventDesc: {
    color: '#555',
    fontSize: 13,
  },
  priorityLabel: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#f5b400',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  priorityBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  saveBtn: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#999',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});
