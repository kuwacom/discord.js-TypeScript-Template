import 'dotenv/config';
import { envSchema } from '@/schemas/env';

const env = envSchema.parse(process.env);

export default env;
