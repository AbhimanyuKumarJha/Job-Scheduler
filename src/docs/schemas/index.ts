import { OpenAPIV3 } from 'openapi-types';
import { commonSchemas } from './common.schemas';
import { jobSchemas } from './job.schemas';
import { executionSchemas } from './execution.schemas';

export const schemas: Record<string, OpenAPIV3.SchemaObject> = {
    ...commonSchemas,
    ...jobSchemas,
    ...executionSchemas,
};
