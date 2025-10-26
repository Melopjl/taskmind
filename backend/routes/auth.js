const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.post('/recuperar-senha', authController.solicitarRecuperacaoSenha);
router.post('/redefinir-senha', authController.redefinirSenha);

module.exports = router;