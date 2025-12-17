import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../shareds/entities';
import { TypeORMRepository } from '../../database';

export class PermissionRepository extends TypeORMRepository<PermissionEntity> {
  constructor(
    @InjectRepository(PermissionEntity)
    repository: Repository<PermissionEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
