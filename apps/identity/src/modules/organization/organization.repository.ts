import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../../shareds/entities';
import { TypeORMRepository } from '../../database';

export class OrganizationRepository extends TypeORMRepository<OrganizationEntity> {
  constructor(
    @InjectRepository(OrganizationEntity)
    repository: Repository<OrganizationEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
