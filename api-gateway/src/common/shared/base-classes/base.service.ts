import { NotFoundException } from '@nestjs/common';
import { BaseRepository } from './base.repository';

export class BaseService<
  T,
  CreateDto,
  UpdateDto,
  Repository extends BaseRepository<T>,
> {
  constructor(private readonly repository: Repository) {}

  async create(createDto: CreateDto) {
    return this.repository.create(createDto as unknown as T);
  }

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findAllFilter(filter?: any): Promise<T[]> {
    return this.repository.findAll(filter);
  }

  async findAllByActiveFilter(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findOneById(id: string) {
    const resultDoc = await this.repository.findById(id);
    if (!resultDoc) throw new NotFoundException('Document not found');
    return resultDoc;
  }

  async findOne(filter: Partial<T>) {
    const resultDoc = await this.repository.findOne(filter);
    if (!resultDoc) throw new NotFoundException('Document not found');
    return resultDoc;
  }

  async updateOneById(id: string, updateDto: UpdateDto): Promise<T | null> {
    const resultDoc = await this.repository.findById(id);
    if (!resultDoc) throw new NotFoundException('Document not found');
    Object.assign(resultDoc, updateDto);
    await resultDoc.save();
    return resultDoc;
  }

  async deleteOneById(id: string) {
    const resultDoc = await this.repository.findById(id);
    if (!resultDoc) throw new NotFoundException('Document not found');
    await resultDoc.deleteOne();
    return { message: 'Document deleted successfully' };
  }
}
