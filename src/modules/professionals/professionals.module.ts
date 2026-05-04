import { Module } from '@nestjs/common';
import { ProfessionalsController } from './professionals.controller';
import { ProfessionalsRepository } from './professionals.repository';
import { ProfessionalsService } from './professionals.service';

@Module({
  controllers: [ProfessionalsController],
  exports: [ProfessionalsService],
  providers: [ProfessionalsRepository, ProfessionalsService],
})
export class ProfessionalsModule {}
