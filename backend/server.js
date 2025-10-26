const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tarefas', require('./routes/tasks'));
app.use('/api/usuario', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '✅ API do Sistema Acadêmico está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada.',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log('🚀 =================================');
  console.log('📚 SISTEMA ACADÊMICO BACKEND - COMPLETO');
  console.log('📍 Servidor rodando na porta', PORT);
  console.log('🌐 http://localhost:' + PORT);
  console.log('🚀 =================================');
});