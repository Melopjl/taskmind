const bcrypt = require('bcryptjs');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class UserController {
  // Obter perfil do usuário
  async getPerfil(req, res) {
    try {
      const [usuarios] = await db.execute(
        `SELECT id, nome, email, foto_perfil, curso, semestre, data_nascimento, telefone, data_criacao 
         FROM usuarios WHERE id = ?`,
        [req.usuario.id]
      );

      if (usuarios.length === 0)
        return res.status(404).json({ error: 'Usuário não encontrado.' });

      const usuario = usuarios[0];

      if (usuario.foto_perfil && !usuario.foto_perfil.startsWith('http')) {
        const filename = path.basename(usuario.foto_perfil);
        usuario.foto_perfil = `/uploads/avatars/${filename}`;
      }

      res.json({ usuario });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Upload de foto de perfil
  async uploadFoto(req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

      const filename = req.file.filename;
      const fotoUrl = `/uploads/avatars/${filename}`;

      // Verificar e excluir foto antiga
      const [usuarios] = await db.execute(
        'SELECT foto_perfil FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      const fotoAntiga = usuarios[0]?.foto_perfil;
      if (fotoAntiga) {
        const filenameAntigo = path.basename(fotoAntiga);
        const caminhoAntigo = path.join(__dirname, '..', 'uploads', 'avatars', filenameAntigo);
        if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
      }

      await db.execute(
        'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
        [fotoUrl, req.usuario.id]
      );

      res.json({ message: 'Foto atualizada com sucesso!', foto_perfil: fotoUrl });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // 🧹 Remover foto de perfil
  async removerFoto(req, res) {
    try {
      const [usuarios] = await db.execute(
        'SELECT foto_perfil FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      const fotoAtual = usuarios[0]?.foto_perfil;
      if (!fotoAtual) return res.status(400).json({ error: 'Nenhuma foto para remover.' });

      const filename = path.basename(fotoAtual);
      const caminhoFoto = path.join(__dirname, '..', 'uploads', 'avatars', filename);

      if (fs.existsSync(caminhoFoto)) fs.unlinkSync(caminhoFoto);

      await db.execute('UPDATE usuarios SET foto_perfil = NULL WHERE id = ?', [req.usuario.id]);

      res.json({ message: 'Foto removida com sucesso!' });
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Atualizar perfil
  async atualizarPerfil(req, res) {
    try {
      const { nome, curso, semestre, data_nascimento, telefone } = req.body;
      const dataNascimentoFormatada = data_nascimento
        ? moment(data_nascimento).format('YYYY-MM-DD')
        : null;

      await db.execute(
        `UPDATE usuarios 
         SET nome = ?, curso = ?, semestre = ?, data_nascimento = ?, telefone = ?
         WHERE id = ?`,
        [nome, curso, semestre, dataNascimentoFormatada, telefone, req.usuario.id]
      );

      const [usuarios] = await db.execute(
        'SELECT id, nome, email, foto_perfil, curso, semestre, data_nascimento, telefone FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      const usuario = usuarios[0];
      if (usuario.foto_perfil && !usuario.foto_perfil.startsWith('http')) {
        const filename = path.basename(usuario.foto_perfil);
        usuario.foto_perfil = `/uploads/avatars/${filename}`;
      }

      res.json({ message: 'Perfil atualizado com sucesso!', usuario });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Alterar senha
  async alterarSenha(req, res) {
    try {
      const { senha_atual, nova_senha } = req.body;

      const [usuarios] = await db.execute(
        'SELECT senha_hash FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      const senhaValida = await bcrypt.compare(senha_atual, usuarios[0].senha_hash);
      if (!senhaValida) return res.status(400).json({ error: 'Senha atual incorreta.' });

      const salt = await bcrypt.genSalt(10);
      const novaSenhaHash = await bcrypt.hash(nova_senha, salt);

      await db.execute(
        'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
        [novaSenhaHash, req.usuario.id]
      );

      res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Servir avatares
  async getAvatar(req, res) {
    try {
      const { filename } = req.params;
      const avatarPath = path.join(__dirname, '..', 'uploads', 'avatars', filename);

      if (fs.existsSync(avatarPath)) return res.sendFile(avatarPath);

      const defaultAvatar = path.join(__dirname, '..', 'assets', 'default-avatar.png');
      if (fs.existsSync(defaultAvatar)) return res.sendFile(defaultAvatar);

      return res.status(404).json({ error: 'Avatar não encontrado' });
    } catch (error) {
      console.error('Erro ao servir avatar:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new UserController();
