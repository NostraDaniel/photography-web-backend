import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  OneToMany,
} from 'typeorm';
import { PageEntity } from './page';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('nvarchar')
  name: string;

  @Column('nvarchar')
  password: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;

  @VersionColumn()
  version: number;

  @OneToMany(type => PageEntity, page => page.author)
  posts: Promise<PageEntity[]>;
}
