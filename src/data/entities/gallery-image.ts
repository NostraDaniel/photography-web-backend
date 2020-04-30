import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { PageEntity } from "./page";

@Entity('galleryImage')
export class GalleryImageEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  src: string;

  @ManyToOne(type => PageEntity, page => page.gallery, {
    onDelete: 'CASCADE',
  })
  page: Promise<PageEntity>

  @CreateDateColumn()
  createdOn: Date;
}