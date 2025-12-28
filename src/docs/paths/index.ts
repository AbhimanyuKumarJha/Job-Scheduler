import { OpenAPIV3 } from 'openapi-types';
import { jobPaths } from './job.paths';
import { executionPaths } from './execution.paths';
import { metricsPaths } from './metrics.paths';
import { healthPaths } from './health.paths';

export const paths: OpenAPIV3.PathsObject = {
    ...jobPaths,
    ...executionPaths,
    ...metricsPaths,
    ...healthPaths,
};
