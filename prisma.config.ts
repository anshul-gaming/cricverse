import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

let dbUrl = env('DATABASE_URL') || '';
if (dbUrl && !dbUrl.includes('schema=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'schema=cricverse';
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
});
