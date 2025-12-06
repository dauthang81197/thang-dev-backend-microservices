import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;
  @Expose()
  uuid: string;
  @Expose()
  email: string;
  @Expose()
  fullName: string;
}
