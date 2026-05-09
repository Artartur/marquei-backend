import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UserRole } from 'src/utils/enums/UserRole';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new service (Manager only)' })
  public async createService(@Body() dto: CreateServiceDto) {
    return this.servicesService.createService(dto);
  }

  @Get('active/:active')
  @ApiOperation({ summary: 'List services filtered by active status' })
  public async findAllActiveServices(@Param('active') active: boolean) {
    return this.servicesService.findAllActiveServices(active);
  }

  @Get()
  @ApiOperation({ summary: 'List all services' })
  public async findAllServices() {
    return this.servicesService.findAllServices();
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Find service by ID' })
  public async findServiceById(@Param('id') id: string) {
    return this.servicesService.findServiceById(id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Update service by ID (Manager only)' })
  public async updateService(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.updateService(id, dto);
  }
}
