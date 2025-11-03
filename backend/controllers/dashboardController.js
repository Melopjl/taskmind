const db = require('../config/database');
const { safe, formatDate } = require('../utils/format');

class DashboardController {
  // Dashboard principal
  async getDashboard(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM

      const [tarefasStats] = await db.execute(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as concluidas,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
          SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) as em_andamento,
          SUM(CASE WHEN status = 'atrasada' THEN 1 ELSE 0 END) as atrasadas,
          AVG(CASE WHEN status = 'concluida' THEN nota ELSE NULL END) as media_notas
         FROM tarefas 
         WHERE usuario_id = ?`,
        [usuarioId]
      );

      const [proximasTarefas] = await db.execute(
        `SELECT * FROM tarefas 
         WHERE usuario_id = ? AND data_vencimento >= NOW() AND status != 'concluida'
         ORDER BY data_vencimento ASC 
         LIMIT 5`,
        [usuarioId]
      );

      const [tarefasAtrasadas] = await db.execute(
        `SELECT * FROM tarefas 
         WHERE usuario_id = ? AND data_vencimento < NOW() AND status != 'concluida'
         ORDER BY data_vencimento ASC 
         LIMIT 5`,
        [usuarioId]
      );

      const [proximosEventos] = await db.execute(
        `SELECT * FROM eventos 
         WHERE usuario_id = ? AND data_inicio >= NOW()
         ORDER BY data_inicio ASC 
         LIMIT 5`,
        [usuarioId]
      );

      const [desempenho] = await db.execute(
        `SELECT * FROM desempenho 
         WHERE usuario_id = ? AND mes_ano = ?`,
        [usuarioId, mesAtual]
      );

      res.json({
        estatisticas: tarefasStats[0],
        proximas_tarefas: proximasTarefas,
        tarefas_atrasadas: tarefasAtrasadas,
        proximos_eventos: proximosEventos,
        desempenho_mensal: desempenho[0] || null
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Calendário - eventos por período
  async getCalendario(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;
      const usuarioId = req.usuario.id;

      const [eventos] = await db.execute(
        `SELECT * FROM eventos 
         WHERE usuario_id = ? AND data_inicio BETWEEN ? AND ?
         ORDER BY data_inicio ASC`,
        [usuarioId, data_inicio, data_fim]
      );

      const [tarefas] = await db.execute(
        `SELECT id, titulo, data_vencimento as data_inicio, data_vencimento as data_fim, 
                'tarefa' as tipo, prioridade, status
         FROM tarefas 
         WHERE usuario_id = ? AND data_vencimento BETWEEN ? AND ?
         ORDER BY data_vencimento ASC`,
        [usuarioId, data_inicio, data_fim]
      );

      res.json({
        eventos,
        tarefas
      });
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Criar evento no calendário
  async criarEvento(req, res) {
    try {
      const { titulo, descricao, data_inicio, data_fim, tipo, cor, local } = req.body;

      const inicioFormatado = formatDate(data_inicio);
      const fimFormatado = formatDate(data_fim);

      const [result] = await db.execute(
        `INSERT INTO eventos (usuario_id, titulo, descricao, data_inicio, data_fim, tipo, cor, local)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          safe(req.usuario.id),
          safe(titulo),
          safe(descricao),
          safe(inicioFormatado),
          safe(fimFormatado),
          safe(tipo),
          safe(cor),
          safe(local)
        ]
      );

      const [eventos] = await db.execute('SELECT * FROM eventos WHERE id = ?', [result.insertId]);

      res.status(201).json({
        message: 'Evento criado com sucesso!',
        evento: eventos[0]
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Estatísticas de desempenho
  async getDesempenho(req, res) {
    try {
      const { meses = 6 } = req.query;
      const usuarioId = req.usuario.id;
      const limiteMeses = parseInt(meses) || 6;

      const [desempenho] = await db.execute(
        `SELECT * FROM desempenho 
         WHERE usuario_id = ? 
         ORDER BY mes_ano DESC 
         LIMIT ${limiteMeses}`,
        [usuarioId]
      );

      const [progresso] = await db.execute(
        `SELECT 
          COUNT(*) as total_tarefas,
          SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as tarefas_concluidas,
          AVG(CASE WHEN status = 'concluida' THEN nota ELSE NULL END) as media_geral
         FROM tarefas 
         WHERE usuario_id = ?`,
        [usuarioId]
      );

      res.json({
        historico: desempenho,
        progresso_geral: progresso[0]
      });
    } catch (error) {
      console.error('Erro ao buscar desempenho:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new DashboardController();
