import { OpenAPIV3 } from 'openapi-types';
import { openAPIConfig } from './openapi.config';
import { schemas } from './schemas';
import { paths } from './paths';

export const openAPISpec: OpenAPIV3.Document = {
    ...openAPIConfig,
    paths,
    components: {
        ...openAPIConfig.components,
        schemas: schemas as Record<string, OpenAPIV3.SchemaObject>,
    },
};
