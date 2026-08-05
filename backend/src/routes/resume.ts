import { Router } from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/upload-url', authenticate, resumeController.getUploadUrl);
router.post('/analyze', authenticate, resumeController.analyzeResume);
router.get('/my-resumes', authenticate, resumeController.getMyResumes);
router.put('/mock-upload', resumeController.mockUpload);

export default router;
