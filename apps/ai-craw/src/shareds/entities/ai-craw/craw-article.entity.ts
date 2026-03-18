import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('craw_articles')
export class CrawArticleEntity extends BaseEntity {
  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'text', nullable: true })
  title!: string;

  @Column({ type: 'text', nullable: true })
  topic!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ type: 'jsonb', nullable: true, name: 'key_points' })
  keyPoints!: string[];
}
