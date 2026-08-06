import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Protect all admin routes with JWT Auth + ADMIN Role requirement
router.use(authenticate, requireRole('ADMIN'));

router.get('/metrics', adminController.getBatchMetrics);
router.get('/export-students', adminController.exportStudentsCSV);
router.post('/questions', adminController.createAdminQuestion);
router.get('/questions', adminController.getAdminQuestions);

export default router;
