import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums/UserRole';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { LinkServiceDto } from './dto/link-service.dto';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private professionalsService: ProfessionalsService) {}

  @Post(':id/schedule')
  @Roles(UserRole.MANAGER)
  public async addSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetScheduleDto,
  ) {
    return this.professionalsService.addSchedule(id, dto);
  }

  @Get('')
  public async findProfessionals() {
    return this.professionalsService.findProfessionals();
  }

  @Get(':id/schedule')
  @Roles(UserRole.MANAGER, UserRole.PROFESSIONAL)
  public async getSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.getSchedule(id);
  }

  @Put(':id/schedule')
  @Roles(UserRole.MANAGER)
  public async replaceSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetScheduleDto,
  ) {
    return this.professionalsService.replaceSchedule(id, dto);
  }

  @Get(':id/services')
  public async getProfessionalServices(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.getProfessionalServices(id);
  }

  @Post(':id/services')
  @Roles(UserRole.MANAGER)
  linkService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkServiceDto,
  ) {
    return this.professionalsService.linkService(id, dto);
  }

  @Delete(':id/services/:serviceId')
  @Roles(UserRole.MANAGER)
  unlinkService(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.professionalsService.unlinkService(id, serviceId);
  }
}
