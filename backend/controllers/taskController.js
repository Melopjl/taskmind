const db = require('../config/database');
const moment = require('moment');

class TaskController {
  // Buscar todas as tarefas do usuário
  async getTarefas(req, res) {
    try {
      const { status, materia, prioridade } = req.query;
      
      let query = `SELECT * FROM tarefas WHERE usuario_id = ?`;
      const params = [req.usuario.id];

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

      res.json({ tarefas });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Criar nova tarefa
  async criarTarefa(req, res) {
    try {
      const { titulo, descricao, materia, data_vencimento, prioridade = 'media', status = 'pendente', cor } = req.body;

      if (!titulo) {
        return res.status(400).json({ error: 'Título é obrigatório.' });
      }

      const [result] = await db.execute(
        `INSERT INTO tarefas (usuario_id, titulo, descricao, materia, data_vencimento, prioridade, status, cor) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.usuario.id, titulo, descricao, materia, data_vencimento, prioridade, status, cor]
      );

      const [tarefas] = await db.execute('SELECT * FROM tarefas WHERE id = ?', [result.insertId]);

      res.status(201).json({
        message: 'Tarefa criada com sucesso!',
        tarefa: tarefas[0]
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
      const { titulo, descricao, materia, data_vencimento, prioridade, status, cor, nota } = req.body;

      const [tarefas] = await db.execute(
        'SELECT id FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, req.usuario.id]
      );

      if (tarefas.length === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }

      // Se marcando como concluída, adicionar data de conclusão
      const dataConclusao = status === 'concluida' ? new Date() : null;

      await db.execute(
        `UPDATE tarefas 
         SET titulo = ?, descricao = ?, materia = ?, data_vencimento = ?, 
             prioridade = ?, status = ?, cor = ?, nota = ?, data_conclusao = ?
         WHERE id = ?`,
        [titulo, descricao, materia, data_vencimento, prioridade, status, cor, nota, dataConclusao, id]
      );

      const [tarefaAtualizada] = await db.execute('SELECT * FROM tarefas WHERE id = ?', [id]);

      res.json({
        message: 'Tarefa atualizada com sucesso!',
        tarefa: tarefaAtualizada[0]
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
        [nota, id]
      );

      res.json({ message: 'Tarefa marcada como concluída!' });
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new TaskController();