import { Router } from 'express';
import { JobController } from '../controllers/job.controller';

const router = Router();
const jobController = new JobController();

router.post('/', jobController.createJob.bind(jobController));
router.get('/', jobController.listJobs.bind(jobController));
router.get('/:jobId', jobController.getJob.bind(jobController));
router.patch('/:jobId', jobController.updateJob.bind(jobController));
router.delete('/:jobId', jobController.deleteJob.bind(jobController));
router.post('/:jobId/pause', jobController.pauseJob.bind(jobController));
router.post('/:jobId/resume', jobController.resumeJob.bind(jobController));
router.get('/:jobId/executions', jobController.getJobExecutions.bind(jobController));
router.post('/:jobId/trigger', jobController.triggerJob.bind(jobController));

export default router;
