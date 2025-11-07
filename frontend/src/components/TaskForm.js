import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { 
  TextInput, 
  Button, 
  SegmentedButtons, 
  Text, 
  Appbar,
  Portal,
  Modal
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

const TaskForm = ({ tarefa, onSave, onCancel, loading = false }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [materia, setMateria] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date());
  const [prioridade, setPrioridade] = useState('media');
  const [status, setStatus] = useState('pendente');
  const [nota, setNota] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (tarefa) {
      setTitulo(tarefa.titulo);
      setDescricao(tarefa.descricao || '');
      setMateria(tarefa.materia || '');
      setDataVencimento(new Date(tarefa.data_vencimento));
      setPrioridade(tarefa.prioridade);
      setStatus(tarefa.status);
      setNota(tarefa.nota ? tarefa.nota.toString() : '');
    }
  }, [tarefa]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(dataVencimento);
      currentDate.setFullYear(selectedDate.getFullYear());
      currentDate.setMonth(selectedDate.getMonth());
      currentDate.setDate(selectedDate.getDate());
      setDataVencimento(currentDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = new Date(dataVencimento);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      setDataVencimento(currentDate);
    }
  };

  const handleSubmit = () => {
    if (!titulo.trim()) {
      alert('Por favor, insira um título para a tarefa');
      return;
    }


    const dataFormatada = moment(dataVencimento).format('YYYY-MM-DD HH:mm:ss');

    const dadosTarefa = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      materia: materia.trim(),
      data_vencimento: dataFormatada,
      prioridade,
      status,
      cor: prioridade === 'alta' ? '#f44336' : prioridade === 'media' ? '#ff9800' : '#4caf50'
    };

    if (status === 'concluida' && nota) {
      dadosTarefa.nota = parseFloat(nota);
    }

    onSave(dadosTarefa);
  };

  const formatarDataHora = (data) => {
    return moment(data).format('DD/MM/YYYY [às] HH:mm');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={onCancel} />
        <Appbar.Content 
          title={tarefa ? 'Editar Tarefa' : 'Nova Tarefa'} 
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <TextInput
            label="Título da Tarefa *"
            value={titulo}
            onChangeText={setTitulo}
            style={styles.input}
            mode="outlined"
            placeholder="Ex: Projeto de Matemática"
          />

          <TextInput
            label="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Descreva os detalhes da tarefa..."
          />

          <TextInput
            label="Matéria/Disciplina"
            value={materia}
            onChangeText={setMateria}
            style={styles.input}
            mode="outlined"
            placeholder="Ex: Matemática, Física, etc."
          />

          <Text style={styles.label}>Data e Hora de Vencimento</Text>
          <View style={styles.dateTimeContainer}>
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(true)}
              style={styles.dateTimeButton}
              icon="calendar"
            >
              {moment(dataVencimento).format('DD/MM/YYYY')}
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowTimePicker(true)}
              style={styles.dateTimeButton}
              icon="clock"
            >
              {moment(dataVencimento).format('HH:mm')}
            </Button>
          </View>

          <Text style={styles.selectedDateTime}>
            Selecionado: {formatarDataHora(dataVencimento)}
          </Text>

          <Text style={styles.label}>Prioridade</Text>
          <SegmentedButtons
            value={prioridade}
            onValueChange={setPrioridade}
            buttons={[
              { value: 'baixa', label: 'Baixa', icon: 'arrow-down', style: prioridade === 'baixa' ? styles.selectedButton : {} },
              { value: 'media', label: 'Média', icon: 'minus', style: prioridade === 'media' ? styles.selectedButton : {} },
              { value: 'alta', label: 'Alta', icon: 'arrow-up', style: prioridade === 'alta' ? styles.selectedButton : {} },
            ]}
            style={styles.segmented}
          />

          <Text style={styles.label}>Status</Text>
          <SegmentedButtons
            value={status}
            onValueChange={setStatus}
            buttons={[
              { value: 'pendente', label: 'Pendente', icon: 'clock-outline', style: status === 'pendente' ? styles.selectedButton : {} },
              { value: 'em_andamento', label: 'Andamento', icon: 'progress-clock', style: status === 'em_andamento' ? styles.selectedButton : {} },
              { value: 'concluida', label: 'Concluída', icon: 'check-circle', style: status === 'concluida' ? styles.selectedButton : {} },
            ]}
            style={styles.segmented}
          />

          {status === 'concluida' && (
            <TextInput
              label="Nota (opcional)"
              value={nota}
              onChangeText={setNota}
              style={styles.input}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="0.0 - 10.0"
            />
          )}

          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              onPress={onCancel}
              style={styles.button}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !titulo.trim()}
              style={styles.button}
            >
              {tarefa ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
          </View>
        </View>
      </ScrollView>

      <Portal>
        {showDatePicker && (
          <Modal
            visible={showDatePicker}
            onDismiss={() => setShowDatePicker(false)}
            contentContainerStyle={styles.pickerModal}
          >
            <DateTimePicker
              value={dataVencimento}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
            <Button onPress={() => setShowDatePicker(false)}>OK</Button>
          </Modal>
        )}

        {showTimePicker && (
          <Modal
            visible={showTimePicker}
            onDismiss={() => setShowTimePicker(false)}
            contentContainerStyle={styles.pickerModal}
          >
            <DateTimePicker
              value={dataVencimento}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
            <Button onPress={() => setShowTimePicker(false)}>OK</Button>
          </Modal>
        )}
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  form: { padding: 16 },
  input: { marginBottom: 16, color: '#f5b400' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#f5b400' },
  dateTimeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateTimeButton: { flex: 0.48, borderColor: '#f5b400', borderWidth: 1 },
  selectedDateTime: { textAlign: 'center', color: '#f5b400', marginBottom: 16, fontStyle: 'italic' },
  segmented: { marginBottom: 16 },
  selectedButton: { backgroundColor: '#f5b400', color: '#000' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  button: { flex: 0.48, borderColor: '#f5b400', borderWidth: 1 },
  pickerModal: { backgroundColor: 'white', margin: 20, borderRadius: 8, padding: 20 },
});

export default TaskForm;
