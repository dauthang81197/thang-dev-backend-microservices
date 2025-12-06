import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  VirtualColumn,
} from 'typeorm';

import { StatusEnum } from '../../common/enum';
import { SizeCompanyEnum } from '../../common/enum/size-company.enum';
import { AbstractEntityWithAudit } from '../../database';
import { OrganizationTypeEntity } from '../organization-type/entities/organization-type.entity';
import { PlanEntity } from '../plan/entities/plan.entity';
import { ReviewPipelineEntity } from '../review-pipelines/entities/review-pipeline.entity';
import { SubscriptionEntity } from '../subscription/entities/subscription.entity';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'organizations' })
export class OrganizationEntity extends AbstractEntityWithAudit {
  @Column({ nullable: false, name: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column()
  public name: string;

  @Index()
  @Column({ nullable: true })
  public code: string;

  @Column({ nullable: true })
  public description: string;

  @Column({ nullable: true })
  public address: string;

  @Column({ nullable: true })
  public content: string;

  @Column({ nullable: true })
  public country: string;

  @Column({ nullable: true })
  public website: string;

  @Column({
    nullable: true,
    enum: SizeCompanyEnum,
  })
  public size: SizeCompanyEnum;

  @OneToMany(() => UserEntity, (user) => user.organization, { nullable: true })
  users: UserEntity[];

  @OneToMany(
    () => SubscriptionEntity,
    (subscription) => subscription.organization,
    {
      nullable: true,
    },
  )
  subscriptions: SubscriptionEntity[];

  @OneToMany(
    () => ReviewPipelineEntity,
    (reviewPipeline) => reviewPipeline.organization,
    { nullable: true },
  )
  reviewPipeline: ReviewPipelineEntity[];

  @ManyToOne(() => OrganizationTypeEntity, (action) => action.organizations, {
    nullable: true,
  })
  @JoinColumn({ name: 'organization_types_code', referencedColumnName: 'code' })
  organizationType: OrganizationTypeEntity;

  @ManyToMany(() => PlanEntity, (plan) => plan.organizations, {
    nullable: true,
  })
  plans: PlanEntity[];

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT("id")
       FROM "users"
       WHERE "organization_id" = ${alias}.id
         AND status = ${StatusEnum.ACTIVE}
         AND deleted_at IS NULL`,
  })
  totalActiveUsers: number;
}
