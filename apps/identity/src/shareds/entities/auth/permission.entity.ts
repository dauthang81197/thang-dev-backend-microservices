import { Entity, Column, OneToMany } from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';
import { BaseEntity } from '../base.entity';

@Entity('permissions')
export class PermissionEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RolePermissionEntity, (rp) => rp.permission)
  rolePermissions: RolePermissionEntity[];
}
