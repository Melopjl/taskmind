const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', dashboardController.getDashboard);
router.get('/calendario', dashboardController.getCalendario);
router.post('/calendario', dashboardController.criarEvento);
router.get('/desempenho', dashboardController.getDesempenho);

module.exports = router;