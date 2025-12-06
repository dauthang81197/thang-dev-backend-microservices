import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../../../shareds/entities/base.entity";
import {UserSessionEntity} from "./user-session.entity";
import {OAuthAccountEntity} from "./oauth-account.entity";
import {ProjectEntity, TaskEntity} from "../project";
import {NotificationEntity} from "../notification";
import {FileEntity} from "../file";
import {AutomationRuleEntity} from "../automation";
import {AnalyticsSnapshotEntity} from "../analytics";


@Entity({ name: "users" })
export class UserEntity extends BaseEntity {
    @Column({ unique: true, length: 190 })
    email!: string;

    @Column({ length: 100, nullable: true })
    name?: string;

    @Column({ name: "password_hash", length: 255, nullable: true })
    passwordHash?: string;

    @Column({ length: 20, default: "local" })
    provider!: string;

    @Column({ name: "provider_id", length: 100, nullable: true })
    providerId?: string;

    @Column({ name: "avatar_url", length: 255, nullable: true })
    avatarUrl?: string;

    @Column({ length: 20, default: "member" })
    role!: string;

    @Column({ name: "is_active", default: true })
    isActive!: boolean;

    @OneToMany(() => UserSessionEntity, (s) => s.user)
    sessions!: UserSessionEntity[];

    @OneToMany(() => OAuthAccountEntity, (o) => o.user)
    oauthAccounts!: OAuthAccountEntity[];

    @OneToMany(() => ProjectEntity, (p) => p.owner)
    projects!: ProjectEntity[];

    @OneToMany(() => TaskEntity, (t) => t.assignee)
    assignedTasks!: TaskEntity[];

    @OneToMany(() => NotificationEntity, (n) => n.user)
    notifications!: NotificationEntity[];

    @OneToMany(() => FileEntity, (f) => f.owner)
    files!: FileEntity[];

    @OneToMany(() => AutomationRuleEntity, (r) => r.creator)
    automationRules!: AutomationRuleEntity[];

    @OneToMany(() => AnalyticsSnapshotEntity, (a) => a.user)
    analyticsSnapshots!: AnalyticsSnapshotEntity[];
}
