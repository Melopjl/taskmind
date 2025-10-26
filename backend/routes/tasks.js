const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', taskController.getTarefas);
router.post('/', taskController.criarTarefa);
router.put('/:id', taskController.atualizarTarefa);
router.delete('/:id', taskController.excluirTarefa);
router.patch('/:id/concluir', taskController.marcarConcluida);

module.exports = router;