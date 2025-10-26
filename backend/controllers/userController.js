const bcrypt = require('bcryptjs');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

class UserController {
  // Obter perfil do usuário
  async getPerfil(req, res) {
    try {
      const [usuarios] = await db.execute(
        `SELECT id, nome, email, foto_perfil, curso, semestre, data_nascimento, telefone, data_criacao 
         FROM usuarios WHERE id = ?`,
        [req.usuario.id]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      res.json({ usuario: usuarios[0] });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Atualizar perfil
  async atualizarPerfil(req, res) {
    try {
      const { nome, curso, semestre, data_nascimento, telefone } = req.body;
      
      await db.execute(
        `UPDATE usuarios 
         SET nome = ?, curso = ?, semestre = ?, data_nascimento = ?, telefone = ?
         WHERE id = ?`,
        [nome, curso, semestre, data_nascimento, telefone, req.usuario.id]
      );

      const [usuarios] = await db.execute(
        'SELECT id, nome, email, foto_perfil, curso, semestre, data_nascimento, telefone FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      res.json({
        message: 'Perfil atualizado com sucesso!',
        usuario: usuarios[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Upload de foto de perfil
  async uploadFoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      const fotoPath = req.file.path;

      // Buscar foto antiga para deletar
      const [usuarios] = await db.execute(
        'SELECT foto_perfil FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      const fotoAntiga = usuarios[0].foto_perfil;
      
      // Deletar foto antiga se existir
      if (fotoAntiga) {
        const caminhoAntigo = path.join(__dirname, '..', fotoAntiga);
        if (fs.existsSync(caminhoAntigo)) {
          fs.unlinkSync(caminhoAntigo);
        }
      }

      // Atualizar no banco
      await db.execute(
        'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
        [fotoPath, req.usuario.id]
      );

      res.json({
        message: 'Foto de perfil atualizada com sucesso!',
        foto_perfil: fotoPath
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Alterar senha
  async alterarSenha(req, res) {
    try {
      const { senha_atual, nova_senha } = req.body;

      // Verificar senha atual
      const [usuarios] = await db.execute(
        'SELECT senha_hash FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      const senhaValida = await bcrypt.compare(senha_atual, usuarios[0].senha_hash);
      if (!senhaValida) {
        return res.status(400).json({ error: 'Senha atual incorreta.' });
      }

      // Hash da nova senha
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
}

module.exports = new UserController();