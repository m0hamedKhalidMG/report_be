const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const {authenticateLawyer,authenticate} = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/user', authenticate, reportController.updateUser);
router.get('/profile', authenticate, authController.getUserData);
router.post('/registerLawyer', authController.registerLawyer);

module.exports = router;
