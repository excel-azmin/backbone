import {
  ClientSession,
  FilterQuery,
  Model,
  PipelineStage,
  QueryOptions,
} from 'mongoose';

export class BaseRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async create(entity: Partial<T>, options?: { session?: ClientSession }) {
    const createdDocument = new this.model(entity);
    return createdDocument.save(options);
  }

  async findAll(options?: { session?: ClientSession }) {
    return this.model.find({}, options).exec();
  }

  async findAllAdmin(
    filter: Partial<T> = {},
    options?: { session?: ClientSession },
  ) {
    return this.model.find(filter, {}, options).exec();
  }

  async findSalesUsers(
    filter: Partial<T> = {},
    options?: { session?: ClientSession },
  ) {
    return this.model.find(filter, {}, options).exec();
  }

  async findByAggregate(
    pipeline: PipelineStage[],
    options?: { session?: ClientSession },
  ) {
    return this.model.aggregate(pipeline, options).exec();
  }

  async findByQuery(
    query: QueryOptions<T>,
    options?: { session?: ClientSession },
  ) {
    return this.model.find(query, options).exec();
  }

  async findOne(filter: Partial<T>, options?: QueryOptions) {
    return this.model.findOne(filter, options).exec();
  }

  async findById(id: string, options?: { session?: ClientSession }) {
    return this.model.findById(id, options).exec();
  }

  async findByIdAndUpdate(
    id: string,
    entity: Partial<T>,
    options?: { session?: ClientSession; readPreference?: string },
  ) {
    return this.model
      .findByIdAndUpdate(id, entity, {
        new: true,
        runValidators: true,
        ...options,
      })
      .exec();
  }

  async updateOne(
    filter: Partial<T>,
    entity: Partial<T>,
    options?: { session?: ClientSession },
  ) {
    return this.model
      .findOneAndUpdate(filter, entity, {
        new: true,
        runValidators: true,
        ...options,
      })
      .exec();
  }

  async findByIdAndDelete(id: string, options?: { session?: ClientSession }) {
    return this.model.findByIdAndDelete(id, options).exec();
  }

  async deleteOne(filter: Partial<T>, options?: { session?: ClientSession }) {
    return this.model.findOneAndDelete(filter, options).exec();
  }

  async deleteMany(
    filter: FilterQuery<T>,
    options?: { session?: ClientSession },
  ) {
    const result = await this.model.deleteMany(filter, options).exec();
    return { deletedCount: result.deletedCount };
  }

  async count(
    filter: PipelineStage[],
    options?: { session?: ClientSession },
  ): Promise<number> {
    filter.push({ $count: 'count' });
    const result = await this.model.aggregate(filter, options).exec();
    return result?.[0]?.count ?? 0;
  }

  async runTransaction(callback: (session: ClientSession) => Promise<void>) {
    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      await callback(session);
      await session.commitTransaction();
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
