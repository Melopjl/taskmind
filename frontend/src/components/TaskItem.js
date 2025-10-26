import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button, Menu } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/pt-br';
import { getCorPrioridade, getCorStatus, isAtrasada } from '../utils/helpers';

moment.locale('pt-br');

const TaskItem = ({ tarefa, onEdit, onDelete, showMenu = true }) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const statusReal = isAtrasada(tarefa.data_vencimento, tarefa.status) 
    ? 'atrasada' 
    : tarefa.status;

  const getStatusText = () => {
    switch (statusReal) {
      case 'concluida': return 'Concluída';
      case 'em_andamento': return 'Em Andamento';
      case 'pendente': return 'Pendente';
      case 'atrasada': return 'Atrasada';
      default: return tarefa.status;
    }
  };

  const getDiasRestantes = () => {
    const hoje = moment();
    const vencimento = moment(tarefa.data_vencimento);
    const dias = vencimento.diff(hoje, 'days');
    
    if (statusReal === 'atrasada') {
      return `Atrasada há ${Math.abs(dias)} dias`;
    }
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence amanhã';
    if (dias > 0) return `Vence em ${dias} dias`;
    return `Venceu há ${Math.abs(dias)} dias`;
  };

  const formatarData = (data) => {
    return moment(data).format('DD/MM/YYYY [às] HH:mm');
  };

  return (
    <Card 
      style={[
        styles.card,
        statusReal === 'atrasada' && styles.cardAtrasada,
        statusReal === 'concluida' && styles.cardConcluida
      ]}
    >
      <Card.Content>
        {/* Header com título e menu */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text 
              style={[
                styles.titulo,
                statusReal === 'concluida' && styles.textoConcluido
              ]}
              numberOfLines={2}
            >
              {tarefa.titulo}
            </Text>
            
            {tarefa.nota && statusReal === 'concluida' && (
              <Chip 
                mode="outlined" 
                style={styles.notaChip}
                textStyle={styles.notaText}
              >
                Nota: {tarefa.nota.toFixed(1)}
              </Chip>
            )}
          </View>

          {showMenu && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button 
                  icon="dots-vertical" 
                  onPress={() => setMenuVisible(true)}
                  mode="text"
                  compact
                />
              }
            >
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onEdit(tarefa);
                }} 
                title="Editar" 
                leadingIcon="pencil"
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onDelete(tarefa.id);
                }} 
                title="Excluir" 
                leadingIcon="delete"
              />
            </Menu>
          )}
        </View>

        {/* Descrição */}
        {tarefa.descricao && (
          <Text 
            style={[
              styles.descricao,
              statusReal === 'concluida' && styles.textoConcluido
            ]}
            numberOfLines={3}
          >
            {tarefa.descricao}
          </Text>
        )}

        {/* Matéria */}
        {tarefa.materia && (
          <View style={styles.materiaContainer}>
            <Text style={styles.materia}>{tarefa.materia}</Text>
          </View>
        )}

        {/* Chips de status e prioridade */}
        <View style={styles.chipsContainer}>
          <Chip 
            mode="outlined" 
            style={[
              styles.statusChip,
              { backgroundColor: getCorStatus(statusReal) }
            ]}
            textStyle={styles.chipText}
            icon={statusReal === 'concluida' ? 'check' : 'clock'}
          >
            {getStatusText()}
          </Chip>

          <Chip 
            mode="outlined" 
            style={[
              styles.priorityChip,
              { backgroundColor: getCorPrioridade(tarefa.prioridade) }
            ]}
            textStyle={styles.chipText}
          >
            {tarefa.prioridade}
          </Chip>
        </View>

        {/* Data e informações */}
        <View style={styles.footer}>
          <Text style={[
            styles.data,
            statusReal === 'atrasada' && styles.dataAtrasada,
            statusReal === 'concluida' && styles.textoConcluido
          ]}>
            📅 {formatarData(tarefa.data_vencimento)}
          </Text>
          
          <Text style={[
            styles.diasRestantes,
            statusReal === 'atrasada' && styles.diasAtrasados,
            statusReal === 'concluida' && styles.textoConcluido
          ]}>
            {getDiasRestantes()}
          </Text>
        </View>

        {/* Data de conclusão */}
        {tarefa.data_conclusao && (
          <Text style={styles.dataConclusao}>
            ✅ Concluída em {formatarData(tarefa.data_conclusao)}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 10,
    elevation: 2,
  },
  cardAtrasada: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    backgroundColor: '#fff8f8',
  },
  cardConcluida: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    backgroundColor: '#f8fff8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textoConcluido: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  materiaContainer: {
    marginBottom: 8,
  },
  materia: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  statusChip: {
    marginRight: 8,
    marginBottom: 4,
    height: 28,
  },
  priorityChip: {
    marginRight: 8,
    marginBottom: 4,
    height: 28,
  },
  notaChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
    height: 24,
  },
  chipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  notaText: {
    color: '#4caf50',
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  data: {
    fontSize: 12,
    color: '#666',
  },
  dataAtrasada: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  diasRestantes: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  diasAtrasados: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  dataConclusao: {
    fontSize: 11,
    color: '#4caf50',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default TaskItem;