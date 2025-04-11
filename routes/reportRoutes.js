const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authMiddleware');
router.get('/my-reports', authenticate, reportController.getUserReports);
router.get('/records/search', authenticate, reportController.searchRecords);
router.get('/records/:id', authenticate, reportController.getRecordDetails);
// Public routes
router.get('/:id', reportController.getReportWithUserDetails); // Updated this line

router.get('/my-reports/filtered', authenticate, reportController.getMyFilteredReports);
// Protected routes (require authentication)
router.post('/', authenticate, reportController.createReport);
router.get('/', reportController.getReports);

module.exports = router;