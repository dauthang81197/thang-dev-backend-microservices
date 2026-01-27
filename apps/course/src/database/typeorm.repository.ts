import { ObjectLiteral, Repository } from 'typeorm';

export abstract class TypeORMRepository<
  T extends ObjectLiteral,
> extends Repository<T> {}
