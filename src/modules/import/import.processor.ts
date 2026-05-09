import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import { ImportStatus, ImportType } from 'generated/prisma/enums';
import { DatabaseService } from '../database/database.service';
import { ImportRepository } from './import.repository';
import { parseFile } from 'src/utils/parserFile';

export interface ImportJobEvent {
  jobId: string;
  importType: ImportType;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class ImportProcessor {
  constructor(
    private importRepository: ImportRepository,
    private databaseService: DatabaseService,
  ) {}

  private get db() {
    return this.databaseService.getClient();
  }

  @OnEvent('import.process', { async: true })
  async handle({ jobId, importType, buffer, mimetype }: ImportJobEvent) {
    await this.importRepository.updateStatus(jobId, ImportStatus.PROCESSING);

    let rows: Record<string, string>[];

    try {
      rows = parseFile(buffer, mimetype);
    } catch (err) {
      await this.importRepository.createError(jobId, {
        row: 0,
        reason: `Failed to parse file: ${(err as Error).message}`,
        rawData: {},
      });
      await this.importRepository.updateStatus(
        jobId,
        ImportStatus.DONE_WITH_ERRORS,
      );
      return;
    }

    await this.importRepository.updateProgress(jobId, 0, 0, rows.length);

    let processed = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
      try {
        if (importType === ImportType.CLIENTS) {
          await this.processClientRow(rows[i]);
        } else {
          await this.processAppointmentRow(rows[i]);
        }
        processed++;
      } catch (err) {
        failed++;
        await this.importRepository.createError(jobId, {
          row: i + 1,
          reason: (err as Error).message,
          rawData: rows[i],
        });
      }

      await this.importRepository.updateProgress(jobId, processed, failed);
    }

    const status =
      failed > 0 ? ImportStatus.DONE_WITH_ERRORS : ImportStatus.DONE;
    await this.importRepository.updateStatus(jobId, status);
  }

  private async processClientRow(row: Record<string, string>) {
    const { name, email, cpf, phone } = row;

    if (!name || !email || !cpf || !phone) {
      throw new Error('Missing required fields: name, email, cpf, phone');
    }

    const { data: existing } = await this.db
      .from('users')
      .select('id')
      .or(`email.eq.${email.trim().toLowerCase()},cpf.eq.${cpf.trim()}`)
      .maybeSingle();

    if (existing) {
      throw new Error(
        `User already exists with email "${email}" or CPF "${cpf}"`,
      );
    }

    const password = await bcrypt.hash(cpf.trim(), 10);

    const { error } = await this.db.from('users').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      cpf: cpf.trim(),
      phone: phone.trim(),
      password,
      role: 'CLIENT',
    });

    if (error) throw new Error(error.message);
  }

  private async processAppointmentRow(row: Record<string, string>) {
    const { clientEmail, professionalEmail, serviceName, scheduledAt } = row;

    if (!clientEmail || !professionalEmail || !serviceName || !scheduledAt) {
      throw new Error(
        'Missing required fields: clientEmail, professionalEmail, serviceName, scheduledAt',
      );
    }

    const { data: client } = await this.db
      .from('users')
      .select('id')
      .eq('email', clientEmail.trim().toLowerCase())
      .maybeSingle<{ id: string }>();

    if (!client) throw new Error(`Client not found: ${clientEmail}`);

    const { data: professionalUser } = await this.db
      .from('users')
      .select('id, professional:professionals(id)')
      .eq('email', professionalEmail.trim().toLowerCase())
      .maybeSingle<{ id: string; professional: { id: string }[] }>();

    const professional = professionalUser?.professional?.[0];
    if (!professional)
      throw new Error(`Professional not found: ${professionalEmail}`);

    const { data: service } = await this.db
      .from('services')
      .select('id, durationMinutes')
      .ilike('name', serviceName.trim())
      .maybeSingle<{ id: string; durationMinutes: number }>();

    if (!service) throw new Error(`Service not found: ${serviceName}`);

    const date = new Date(scheduledAt.trim());
    if (isNaN(date.getTime())) throw new Error(`Invalid date: ${scheduledAt}`);

    const endsAt = new Date(date.getTime() + service.durationMinutes * 60_000);

    const { error } = await this.db.from('appointments').insert({
      clientId: client.id,
      professionalId: professional.id,
      serviceId: service.id,
      scheduledAt: date.toISOString(),
      endsAt: endsAt.toISOString(),
      status: 'SCHEDULED',
    });

    if (error) throw new Error(error.message);
  }
}
