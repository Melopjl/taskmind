const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);

router.get('/perfil', userController.getPerfil);
router.put('/perfil', userController.atualizarPerfil);
router.put('/senha', userController.alterarSenha);
router.post('/foto', upload.single('foto'), userController.uploadFoto);
router.delete('/foto', userController.removerFoto);
router.get('/avatar/:filename', userController.getAvatar);

module.exports = router;
