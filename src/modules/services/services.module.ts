import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './services.repository';
import { ServicesService } from './services.service';

@Module({
  controllers: [ServicesController],
  exports: [ServicesService],
  providers: [ServicesRepository, ServicesService],
})
export class ServicesModule {}
