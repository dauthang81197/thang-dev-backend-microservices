import { BadRequestException, Injectable } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { OrganizationEntity } from '../../shareds/entities';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async saveOrganization(organization: Partial<OrganizationEntity>) {
    const organizationFind = await this.organizationRepository.findOne({
      where: [{ code: organization.code }],
    });

    if (organizationFind) {
      throw new BadRequestException('Organization code already exists');
    }
    return await this.organizationRepository.save(organization);
  }
}
