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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfessionalsService } from './professionals.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums/UserRole';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { LinkServiceDto } from './dto/link-service.dto';

@ApiTags('Professionals')
@ApiBearerAuth()
@Controller('professionals')
export class ProfessionalsController {
  constructor(private professionalsService: ProfessionalsService) {}

  @Post(':id/schedule')
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary: 'Add work schedule to a professional (Manager only)',
  })
  public async addSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetScheduleDto,
  ) {
    return this.professionalsService.addSchedule(id, dto);
  }

  @Get('')
  @ApiOperation({ summary: 'List all professionals' })
  public async findProfessionals() {
    return this.professionalsService.findProfessionals();
  }

  @Get(':id/schedule')
  @Roles(UserRole.MANAGER, UserRole.PROFESSIONAL)
  @ApiOperation({
    summary: 'Get work schedule of a professional (Manager or Professional)',
  })
  public async getSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.getSchedule(id);
  }

  @Put(':id/schedule')
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary: 'Replace work schedule of a professional (Manager only)',
  })
  public async replaceSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetScheduleDto,
  ) {
    return this.professionalsService.replaceSchedule(id, dto);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'List services linked to a professional' })
  public async getProfessionalServices(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.getProfessionalServices(id);
  }

  @Post(':id/services')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Link a service to a professional (Manager only)' })
  linkService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkServiceDto,
  ) {
    return this.professionalsService.linkService(id, dto);
  }

  @Delete(':id/services/:serviceId')
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary: 'Unlink a service from a professional (Manager only)',
  })
  unlinkService(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.professionalsService.unlinkService(id, serviceId);
  }
}
