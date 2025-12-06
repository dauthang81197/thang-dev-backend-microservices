import { Column, Entity, Generated, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../shareds/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'organizations' })
export class OrganizationEntity extends BaseEntity {
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

  @OneToMany(() => UserEntity, (user) => user.organization, { nullable: true })
  users: UserEntity[];
}
