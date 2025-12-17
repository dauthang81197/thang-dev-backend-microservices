import { hashSync } from 'bcrypt';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { UserEntity } from '../../shareds/entities';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo() {
    return UserEntity;
  }

  beforeInsert(event: InsertEvent<UserEntity>): void {
    if (event.entity.passwordHash) {
      event.entity.passwordHash = hashSync(event.entity.passwordHash, 10);
    }
  }

  beforeUpdate(event: UpdateEvent<UserEntity>): void {
    const entity = event.entity as UserEntity;

    if (
      entity.passwordHash &&
      entity.passwordHash !== event.databaseEntity?.passwordHash
    ) {
      entity.passwordHash = hashSync(
        event?.entity?.passwordHash ?? 'Admin@123',
        10,
      );
    }
  }
}
