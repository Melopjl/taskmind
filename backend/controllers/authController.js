const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const nodemailer = require('nodemailer');

class AuthController {
  // Registrar usuário
  async registrar(req, res) {
    try {
      const { nome, email, senha, curso, semestre, data_nascimento, telefone } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
      }

      const [usuarios] = await db.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if (usuarios.length > 0) {
        return res.status(400).json({ error: 'Usuário já existe.' });
      }

     
      let dataNascimentoFormatada = null;
      if (data_nascimento && data_nascimento.includes('/')) {
        const [dia, mes, ano] = data_nascimento.split('/');
        if (dia && mes && ano) {
          dataNascimentoFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      } else {
        dataNascimentoFormatada = data_nascimento || null;
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const [result] = await db.execute(
        'INSERT INTO usuarios (nome, email, senha_hash, curso, semestre, data_nascimento, telefone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nome, email, senhaHash, curso, semestre, dataNascimentoFormatada, telefone]
      );

      const token = jwt.sign(
        { id: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        token,
        usuario: {
          id: result.insertId,
          nome,
          email,
          curso,
          semestre
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      }

      const [usuarios] = await db.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );

      if (usuarios.length === 0) {
        return res.status(400).json({ error: 'Credenciais inválidas.' });
      }

      const usuario = usuarios[0];
    
      if (usuario.senha_hash && usuario.senha_hash.includes('examplehash')) {
        return res.status(400).json({ error: 'Use a senha: 123456 para usuários de exemplo' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      
      if (!senhaValida) {
        return res.status(400).json({ error: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      const { senha_hash, ...usuarioSemSenha } = usuario;

      res.json({
        message: 'Login realizado com sucesso!',
        token,
        usuario: usuarioSemSenha
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Solicitar recuperação de senha
  async solicitarRecuperacaoSenha(req, res) {
    try {
      const { email } = req.body;

      const [usuarios] = await db.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const usuario = usuarios[0];
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const dataExpiracao = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

      await db.execute(
        'INSERT INTO redefinicoes_senha (usuario_id, token, data_expiracao) VALUES (?, ?, ?)',
        [usuario.id, token, dataExpiracao]
      );

      console.log(`Token de recuperação para ${email}: ${token}`);
      
      res.json({ 
        message: 'Email de recuperação enviado!',
        token: token 
      });
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Redefinir senha
  async redefinirSenha(req, res) {
    try {
      const { token, novaSenha } = req.body;

      const [tokens] = await db.execute(
        'SELECT * FROM redefinicoes_senha WHERE token = ? AND utilizado = FALSE AND data_expiracao > NOW()',
        [token]
      );

      if (tokens.length === 0) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' });
      }

      const tokenData = tokens[0];
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(novaSenha, salt);

      // Atualizar senha
      await db.execute(
        'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
        [senhaHash, tokenData.usuario_id]
      );

      
      await db.execute(
        'UPDATE redefinicoes_senha SET utilizado = TRUE WHERE id = ?',
        [tokenData.id]
      );

      res.json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Criar usuário de teste
  async criarUsuarioTeste(req, res) {
    try {
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash('123456', salt);

      const [result] = await db.execute(
        'INSERT INTO usuarios (nome, email, senha_hash, curso, semestre) VALUES (?, ?, ?, ?, ?)',
        ['Usuário Teste', 'teste@email.com', senhaHash, 'Engenharia', 3]
      );

      res.json({
        message: 'Usuário teste criado! Email: teste@email.com, Senha: 123456',
        usuario: { id: result.insertId, email: 'teste@email.com' }
      });
    } catch (error) {
      console.error('Erro ao criar usuário teste:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new AuthController();