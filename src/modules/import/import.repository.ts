import { Injectable } from '@nestjs/common';
import { ImportStatus, ImportType } from 'generated/prisma/enums';
import { DatabaseService } from '../database/database.service';
import { ImportError, ImportJob } from 'src/interfaces/importJob.interface';

@Injectable()
export class ImportRepository {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.getClient();
  }

  public async create(data: {
    managerId: string;
    fileName: string;
    importType: ImportType;
  }): Promise<ImportJob> {
    const response = await this.db
      .from('importJobs')
      .insert(data)
      .select()
      .single();

    if (response.error) throw new Error(response.error.message);

    return response.data as ImportJob;
  }

  public async findAll(): Promise<ImportJob[]> {
    const response = await this.db
      .from('importJobs')
      .select('*')
      .order('createdAt', { ascending: false });

    if (response.error) throw new Error(response.error.message);

    return (response.data ?? []) as ImportJob[];
  }

  public async findById(id: string): Promise<ImportJob> {
    const response = await this.db
      .from('importJobs')
      .select('*')
      .eq('id', id)
      .single();

    if (response.error) throw new Error(`Import job not found: ${id}`);

    return response.data as ImportJob;
  }

  public async findErrors(id: string): Promise<ImportError[]> {
    const { data, error } = await this.db
      .from('importErrors')
      .select('*')
      .eq('importJobId', id)
      .order('row', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []) as ImportError[];
  }

  public async updateStatus(id: string, status: ImportStatus) {
    const { error } = await this.db
      .from('importJobs')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  public async updateProgress(
    id: string,
    processed: number,
    failed: number,
    totalRows?: number,
  ) {
    const { error } = await this.db
      .from('importJobs')
      .update({
        processed,
        failed,
        ...(totalRows !== undefined && { totalRows }),
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  public async createError(
    importJobId: string,
    data: { row: number; reason: string; rawData: object },
  ) {
    const { error } = await this.db
      .from('importErrors')
      .insert({ importJobId, ...data });

    if (error) throw new Error(error.message);
  }
}
