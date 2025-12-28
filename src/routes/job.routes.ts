import { Router } from 'express';
import { JobController } from '../controllers/job.controller';

const router = Router();
const jobController = new JobController();

// Core job management routes
router.post('/', jobController.createJob.bind(jobController));
router.get('/', jobController.listJobs.bind(jobController));
router.get('/:jobId', jobController.getJob.bind(jobController));
router.put('/:jobId', jobController.updateJob.bind(jobController));
router.delete('/:jobId', jobController.deleteJob.bind(jobController));

// Job execution routes
router.get('/:jobId/executions', jobController.getJobExecutions.bind(jobController));
router.post('/:jobId/trigger', jobController.triggerJob.bind(jobController));

export default router;
