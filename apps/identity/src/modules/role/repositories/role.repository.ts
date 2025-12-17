import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../shareds/entities';
import { TypeORMRepository } from '../../../database';

export class RoleRepository extends TypeORMRepository<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    repository: Repository<RoleEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
