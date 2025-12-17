import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserRoleEntity } from '../../shareds/entities';
import { UserService } from './user.service';
import { UserController } from './controllers/user.controller';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRoleEntity])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserRoleRepository],
  exports: [UserService, UserRepository, UserRoleRepository],
})
export class UserModule {}
