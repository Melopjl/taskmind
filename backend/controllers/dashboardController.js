const db = require('../config/database');
const moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');

// Evita undefined quebrar o insert
function safe(value) {
  return value === undefined ? null : value;
}

// 🔧 Converte datas de entrada para formato MySQL
function formatDateForMySQL(date) {
  if (!date) return null;
  return moment(date, [
    moment.ISO_8601,
    'YYYY-MM-DD',
    'DD/MM/YYYY',
    'DD-MM-YYYY',
    'YYYY/MM/DD',
    'DD/MM/YYYY HH:mm',
    'DD-MM-YYYY HH:mm',
  ]).format('YYYY-MM-DD HH:mm:ss');
}

// 🔧 Formata datas do banco para exibição no app (pt-BR)
function formatDateToBR(date) {
  if (!date) return null;
  return moment(date).format('DD/MM/YYYY HH:mm');
}

class DashboardController {
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

      // Próximas tarefas 
      const [proximasTarefas] = await db.execute(
        `SELECT * FROM tarefas 
         WHERE usuario_id = ? 
           AND data_vencimento >= NOW() 
           AND status != 'concluida'
         ORDER BY data_vencimento ASC 
         LIMIT 5`,
        [usuarioId]
      );

      // Tarefas atrasadas
      const [tarefasAtrasadas] = await db.execute(
        `SELECT * FROM tarefas 
         WHERE usuario_id = ? 
           AND data_vencimento < NOW() 
           AND status != 'concluida'
         ORDER BY data_vencimento ASC 
         LIMIT 5`,
        [usuarioId]
      );

      // Próximos eventos
      const [proximosEventos] = await db.execute(
        `SELECT * FROM eventos 
         WHERE usuario_id = ? 
           AND data_inicio >= NOW()
         ORDER BY data_inicio ASC 
         LIMIT 5`,
        [usuarioId]
      );

      // Desempenho mensal
      const [desempenho] = await db.execute(
        `SELECT * FROM desempenho 
         WHERE usuario_id = ? AND mes_ano = ?`,
        [usuarioId, mesAtual]
      );

      const formatTarefas = (arr) =>
        arr.map((t) => ({
          ...t,
          data_vencimento: formatDateToBR(t.data_vencimento),
          data_conclusao: formatDateToBR(t.data_conclusao),
        }));

      const formatEventos = (arr) =>
        arr.map((e) => ({
          ...e,
          data_inicio: formatDateToBR(e.data_inicio),
          data_fim: formatDateToBR(e.data_fim),
        }));

      res.json({
        estatisticas: tarefasStats[0],
        tarefas: {
          proximas: formatTarefas(proximasTarefas),
          atrasadas: formatTarefas(tarefasAtrasadas),
        },
        eventos: {
          proximos: formatEventos(proximosEventos),
        },
        desempenho_mensal: desempenho[0] || null,
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Calendário (tarefas + eventos)
  async getCalendario(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;
      const usuarioId = req.usuario.id;

      const dataInicioSQL = formatDateForMySQL(data_inicio);
      const dataFimSQL = formatDateForMySQL(data_fim);

      const [eventos] = await db.execute(
        `SELECT * FROM eventos 
         WHERE usuario_id = ? 
           AND data_inicio BETWEEN ? AND ?
         ORDER BY data_inicio ASC`,
        [usuarioId, dataInicioSQL, dataFimSQL]
      );

      const [tarefas] = await db.execute(
        `SELECT id, titulo, data_vencimento as data_inicio, data_vencimento as data_fim, 
                'tarefa' as tipo, prioridade, status
         FROM tarefas 
         WHERE usuario_id = ? 
           AND data_vencimento BETWEEN ? AND ?
         ORDER BY data_vencimento ASC`,
        [usuarioId, dataInicioSQL, dataFimSQL]
      );

      res.json({
        eventos: eventos.map((e) => ({
          ...e,
          data_inicio: formatDateToBR(e.data_inicio),
          data_fim: formatDateToBR(e.data_fim),
        })),
        tarefas: tarefas.map((t) => ({
          ...t,
          data_inicio: formatDateToBR(t.data_inicio),
          data_fim: formatDateToBR(t.data_fim),
        })),
      });
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Criar evento
  async criarEvento(req, res) {
    try {
      const { titulo, descricao, data_inicio, data_fim, tipo, cor, local } = req.body;

      const inicioFormatado = formatDateForMySQL(data_inicio);
      const fimFormatado = formatDateForMySQL(data_fim);

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
          safe(local),
        ]
      );

      const [eventos] = await db.execute('SELECT * FROM eventos WHERE id = ?', [result.insertId]);
      const evento = eventos[0];

      evento.data_inicio = formatDateToBR(evento.data_inicio);
      evento.data_fim = formatDateToBR(evento.data_fim);

      res.status(201).json({
        message: 'Evento criado com sucesso!',
        evento,
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Desempenho histórico
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
        progresso_geral: progresso[0],
      });
    } catch (error) {
      console.error('Erro ao buscar desempenho:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new DashboardController();
