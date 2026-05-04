import { ConfigService } from '@nestjs/config';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

const configService = new ConfigService();
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
