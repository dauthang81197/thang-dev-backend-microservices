import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermissionEntity } from '../../../shareds/entities';
import { TypeORMRepository } from '../../../database';

export class RolePermissionRepository extends TypeORMRepository<RolePermissionEntity> {
  constructor(
    @InjectRepository(RolePermissionEntity)
    repository: Repository<RolePermissionEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
