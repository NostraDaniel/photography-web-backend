import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user";
import { GalleryImageEntity } from "./gallery-image";

@Entity('pages')
export class PageEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column('nvarchar')
  name: string;

  @Column('nvarchar')
  title: string;

  @Column({ type: 'nvarchar', length: 10000})
  content: string;

  @Column({ type: 'nvarchar', length: 1000})
  description: string;

  @OneToMany(type => GalleryImageEntity, image => image.page, {cascade: true})
  gallery: Promise<GalleryImageEntity[]>

  @ManyToOne(type => User, user => user.posts)
  author: Promise<User>;
  
  @CreateDateColumn()
  createdOn: Date;
}