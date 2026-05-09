import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ImportType } from 'generated/prisma/enums';
import { ImportRepository } from './import.repository';
import type { ImportJobEvent } from './import.processor';

const ALLOWED_MIMETYPES = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

@Injectable()
export class ImportService {
  constructor(
    private eventEmitter: EventEmitter2,
    private importRepository: ImportRepository,
  ) {}

  public async upload(
    file: Express.Multer.File,
    importType: ImportType,
    managerId: string,
  ) {
    if (!file) throw new BadRequestException('No file provided.');

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only CSV and Excel files are accepted.',
      );
    }

    const job = await this.importRepository.create({
      managerId,
      fileName: file.originalname,
      importType,
    });

    const event: ImportJobEvent = {
      jobId: job.id,
      importType,
      buffer: file.buffer,
      mimetype: file.mimetype,
    };

    this.eventEmitter.emit('import.process', event);

    return job;
  }

  public findAll() {
    return this.importRepository.findAll();
  }

  public findById(id: string) {
    return this.importRepository.findById(id);
  }

  public findErrors(id: string) {
    return this.importRepository.findErrors(id);
  }
}
