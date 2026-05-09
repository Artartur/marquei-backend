import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';
import { ImportRepository } from './import.repository';

@Module({
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor, ImportRepository],
})
export class ImportModule {}
