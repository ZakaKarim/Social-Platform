import express from 'express'
const router = express.Router();

import { addReport, fetchAllReport } from '../controllers/report.controller.js';

router.route('/').post(addReport)
router.route('/').get(fetchAllReport)

export default router;