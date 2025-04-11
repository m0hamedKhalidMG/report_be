const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authMiddleware');

router.put('/', authenticate, reportController.updateUser);

module.exports = router;