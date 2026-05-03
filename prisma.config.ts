import { defineConfig } from 'prisma/config';
import { configService } from 'src/utils/configService';

const dbUrl = configService.get<string>('DATABASE_URL');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: dbUrl,
  },
});
