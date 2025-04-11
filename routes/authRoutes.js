const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/', authenticate, reportController.updateUser);

module.exports = router;