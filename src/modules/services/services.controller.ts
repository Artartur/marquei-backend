import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UserRole } from 'src/utils/enums/UserRole';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  public async createService(@Body() dto: CreateServiceDto) {
    return this.servicesService.createService(dto);
  }

  @Get('active/:active')
  public async findAllActiveServices(@Param('active') active: boolean) {
    return this.servicesService.findAllActiveServices(active);
  }

  @Get()
  public async findAllServices() {
    return this.servicesService.findAllServices();
  }

  @Get('id/:id')
  public async findServiceById(@Param('id') id: string) {
    return this.servicesService.findServiceById(id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  public async updateService(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.updateService(id, dto);
  }
}
