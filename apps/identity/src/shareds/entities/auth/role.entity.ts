import { Entity, Column, OneToMany } from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';
import { UserRoleEntity } from './user-role.entity';
import { BaseEntity } from '../base.entity';

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RolePermissionEntity, (rp) => rp.role)
  rolePermissions: RolePermissionEntity[];

  @OneToMany(() => UserRoleEntity, (ur) => ur.role)
  userRoles: UserRoleEntity[];
}
