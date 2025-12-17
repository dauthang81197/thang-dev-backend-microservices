import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from '../../shareds/entities';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity])],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService, OrganizationRepository],
})
export class OrganizationModule {}
