const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);


router.get('/perfil', auth, userController.getPerfil);
router.put('/perfil', auth, userController.atualizarPerfil);
router.put('/senha', auth, userController.alterarSenha);
router.post('/foto', auth, upload.single('foto'), userController.uploadFoto);

router.get('/avatar/:filename', userController.getAvatar);

module.exports = router;