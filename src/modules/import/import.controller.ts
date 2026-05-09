import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ImportService } from './import.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/interfaces/authenticatedUser.interface';
import { UserRole } from 'src/utils/enums/UserRole';
import { ImportType } from 'src/utils/enums/ImportType';

@ApiTags('Import')
@ApiBearerAuth()
@Roles(UserRole.MANAGER)
@Controller('import')
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({
    summary:
      'Upload CSV or Excel to import clients or appointments (Manager only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'type', enum: ImportType, required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: ImportType,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.importService.upload(file, type, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all import jobs (Manager only)' })
  findAll() {
    return this.importService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import job status by ID (Manager only)' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.importService.findById(id);
  }

  @Get(':id/errors')
  @ApiOperation({ summary: 'Get failed rows of an import job (Manager only)' })
  findErrors(@Param('id', ParseUUIDPipe) id: string) {
    return this.importService.findErrors(id);
  }
}
