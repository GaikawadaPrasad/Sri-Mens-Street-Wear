const express = require('express');
const router = express.Router();
const {
  getAllReport,
  getTodayReport,
  getDateReport,
  getRangeReport
} = require('../controllers/reportController');

router.get('/all', getAllReport);
router.get('/today', getTodayReport);
router.get('/date/:date', getDateReport);
router.get('/range', getRangeReport);

module.exports = router;
