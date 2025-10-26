const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);

router.get('/perfil', userController.getPerfil);
router.put('/perfil', userController.atualizarPerfil);
router.post('/foto', upload.single('foto'), userController.uploadFoto);
router.put('/senha', userController.alterarSenha);

module.exports = router;