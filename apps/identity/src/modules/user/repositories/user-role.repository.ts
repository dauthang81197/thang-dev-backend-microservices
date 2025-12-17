import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleEntity } from '../../../shareds/entities';
import { TypeORMRepository } from '../../../database';

export class UserRoleRepository extends TypeORMRepository<UserRoleEntity> {
  constructor(
    @InjectRepository(UserRoleEntity)
    repository: Repository<UserRoleEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
