import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CommonModule } from '../common/common.module';
import { User } from '../data/entities/user';
import { PageEntity } from '../data/entities/page';
import { GalleryImageEntity } from '../data/entities/gallery-image';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageEntity, User, GalleryImageEntity]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    CommonModule
  ],
  providers: [PagesService],
  controllers: [PagesController],
  exports: [PagesService],
})
export class PagesModule {}
