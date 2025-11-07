const db = require('../config/database');
const moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');

function safe(value) {
  return value === undefined ? null : value;
}

function formatDateForMySQL(date) {
  if (!date) return null;

  const iso = moment(date, moment.ISO_8601, true);
  if (iso.isValid()) {
    return iso.local().format('YYYY-MM-DD HH:mm:ss');
  }

  const br = moment(date, 'DD/MM/YYYY HH:mm', true);
  if (br.isValid()) {
    return br.format('YYYY-MM-DD HH:mm:ss');
  }

  const simple = moment(date, 'YYYY-MM-DD', true);
  if (simple.isValid()) {
    return simple.format('YYYY-MM-DD HH:mm:ss');
  }

  console.warn('⚠️ Data inválida recebida:', date);
  return null;
}

function formatDateToBR(date) {
  if (!date) return null;
  return moment(date).format('DD/MM/YYYY HH:mm');
}

class TaskController {
  // Buscar tarefas
  async getTarefas(req, res) {
    try {
      const { status, materia, prioridade } = req.query;
      const params = [req.usuario.id];
      let query = `SELECT * FROM tarefas WHERE usuario_id = ?`;

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
      if (materia) {
        query += ` AND materia = ?`;
        params.push(materia);
      }
      if (prioridade) {
        query += ` AND prioridade = ?`;
        params.push(prioridade);
      }

      query += ` ORDER BY data_vencimento ASC`;
      const [tarefas] = await db.execute(query, params);

      const tarefasFormatadas = tarefas.map(t => ({
        ...t,
        data_vencimento: formatDateToBR(t.data_vencimento),
        data_conclusao: formatDateToBR(t.data_conclusao)
      }));

      res.json({ tarefas: tarefasFormatadas });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Criar tarefa
  async criarTarefa(req, res) {
    try {
      const {
        titulo,
        descricao,
        materia,
        data_vencimento,
        prioridade = 'media',
        status = 'pendente',
        cor
      } = req.body;

      if (!titulo) {
        return res.status(400).json({ error: 'Título é obrigatório.' });
      }

      const dataFormatada = formatDateForMySQL(data_vencimento);

      const [result] = await db.execute(
        `INSERT INTO tarefas (usuario_id, titulo, descricao, materia, data_vencimento, prioridade, status, cor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          safe(req.usuario.id),
          safe(titulo),
          safe(descricao),
          safe(materia),
          safe(dataFormatada),
          safe(prioridade),
          safe(status),
          safe(cor)
        ]
      );

      const [tarefas] = await db.execute('SELECT * FROM tarefas WHERE id = ?', [result.insertId]);
      const tarefa = tarefas[0];
      tarefa.data_vencimento = formatDateToBR(tarefa.data_vencimento);

      res.status(201).json({
        message: 'Tarefa criada com sucesso!',
        tarefa
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Atualizar tarefa
  async atualizarTarefa(req, res) {
    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        materia,
        data_vencimento,
        prioridade,
        status,
        cor,
        nota
      } = req.body;

      const [tarefas] = await db.execute(
        'SELECT id FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, req.usuario.id]
      );

      if (tarefas.length === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }

      const dataFormatada = formatDateForMySQL(data_vencimento);
      const dataConclusao = status === 'concluida' ? moment().format('YYYY-MM-DD HH:mm:ss') : null;

      await db.execute(
        `UPDATE tarefas 
         SET titulo = ?, descricao = ?, materia = ?, data_vencimento = ?, 
             prioridade = ?, status = ?, cor = ?, nota = ?, data_conclusao = ?
         WHERE id = ?`,
        [
          safe(titulo),
          safe(descricao),
          safe(materia),
          safe(dataFormatada),
          safe(prioridade),
          safe(status),
          safe(cor),
          safe(nota),
          safe(dataConclusao),
          safe(id)
        ]
      );

      const [tarefaAtualizada] = await db.execute('SELECT * FROM tarefas WHERE id = ?', [id]);
      const tarefa = tarefaAtualizada[0];
      tarefa.data_vencimento = formatDateToBR(tarefa.data_vencimento);
      tarefa.data_conclusao = formatDateToBR(tarefa.data_conclusao);

      res.json({
        message: 'Tarefa atualizada com sucesso!',
        tarefa
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Excluir tarefa
  async excluirTarefa(req, res) {
    try {
      const { id } = req.params;

      const [tarefas] = await db.execute(
        'SELECT id FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, req.usuario.id]
      );

      if (tarefas.length === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }

      await db.execute('DELETE FROM tarefas WHERE id = ?', [id]);
      res.json({ message: 'Tarefa excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Marcar tarefa como concluída
  async marcarConcluida(req, res) {
    try {
      const { id } = req.params;
      const { nota } = req.body;

      const [tarefas] = await db.execute(
        'SELECT id FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, req.usuario.id]
      );

      if (tarefas.length === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }

      await db.execute(
        'UPDATE tarefas SET status = "concluida", data_conclusao = NOW(), nota = ? WHERE id = ?',
        [safe(nota), safe(id)]
      );

      res.json({ message: 'Tarefa marcada como concluída!' });
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new TaskController();
