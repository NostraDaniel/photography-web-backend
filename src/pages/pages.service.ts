import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageEntity } from '../data/entities/page';
import { NewPageDTO } from '../models/page/new-page-dto';
import { User } from '../data/entities/user';
import { ShowImageDTO } from '../models/page/show-image-dto';
import { NoFileException } from '../common/exceptions/pages/no-file.exception';
import { UploadedFileImageDTO } from '../models/page/uploaded-file-image-dto';
import { isArray } from 'util';
import { GalleryImageEntity } from '../data/entities/gallery-image';
import { UpdatePageDTO } from '../models/page/update-page-dto';
import * as fs from 'fs';
import { PageNotFound } from '../common/exceptions/pages/page-not-found.exception';

@Injectable()
export class PagesService {

  private readonly SERVER_URL:  string  =  "http://localhost:4202/";

  constructor(
    @InjectRepository(PageEntity)
    private readonly pagesRepository: Repository<PageEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GalleryImageEntity)
    private readonly galleryImageRepository: Repository<GalleryImageEntity>,
  ) {}
  
  // GET Shows all posts
  public async getAllPages(page: number = 1, pagesPerPage: number = 12, filter: string = ''): Promise<{pagesCount: number, pages: PageEntity[]}> {
    const allPosts: [PageEntity[], number] = filter.trim().length > 0 ? 
      await this.pagesRepository.findAndCount({
        where: {
          title: filter,
        },
        relations: ['gallery'],
        take: pagesPerPage,
        skip: pagesPerPage * (page - 1),
        order: {
          createdOn: "DESC"
        },
      }) :
      await this.pagesRepository.findAndCount({
        take: pagesPerPage,
        skip: pagesPerPage * (page - 1),
        relations: [ 'gallery'],
        order: {
          createdOn: "DESC"
        },
      });
    console.log(allPosts);
    return {pagesCount: allPosts[1], pages: allPosts[0]};
  }

  // GET Show a single post by :id
  public async getSinglePost(id: string): Promise<PageEntity> {
    const foundPage = await this.pagesRepository.findOne({
      where: {
        id
      },
      relations: ['gallery'],
    })
    console.log(foundPage);
    if ( !foundPage ) {
      throw new PageNotFound(`Post with this ID ${id} doesn't exist`);
    }
    await foundPage.gallery;
    console.log('foundPost', foundPage);
    return foundPage;
  }

  // GET Show posts for the front page
  public async getFrontPagePosts(): Promise<PageEntity[]> {
    const posts = 
      await this.pagesRepository.find({
        where: { 
            isPublished: true,
            isFrontPage: true
        },
        order: {
          createdOn: "DESC"
        },
        take: 6,
      });

    return posts;
  }
  
  // POST Create a page
  public async createNewPage(body: NewPageDTO, author: User): Promise<PageEntity> {
    const { name, title, content, isPublished, description, gallery } = body;
    const newPost = new PageEntity();

    newPost.author = Promise.resolve(author);
    newPost.name = name;
    newPost.title = title;
    newPost.content = content;
    newPost.description = description;

    if(!!isPublished) {
      newPost.isPublished = isPublished;
    }
    
    if(isArray(gallery) && gallery.length > 0) {
      const arrGallery = gallery.map(image => {
        const newImg =  new GalleryImageEntity();
        
        newImg.filename = image.filename;
        newImg.src = image.src;
        
        return newImg;
      });
      console.log('v galeriqta', arrGallery);
  
      newPost.gallery = Promise.resolve(arrGallery);
    }

    const savedPage = await this.pagesRepository.save(newPost);
    console.log('savednat page', savedPage);
    return savedPage;
  }

  // POST Save an image for the front of the post
  public async uploadImage(file: any): Promise<UploadedFileImageDTO> {
    if(!file) {
      throw new NoFileException('No file available!');
    }
    
    const src = `${this.SERVER_URL}pages/${file.path}`;
    const { filename } = file;

    return await { src, filename }
  }

  // POST Save images for gallery
  public async uploadImages(files: any): Promise<ShowImageDTO[]> {
    if(files.lenght) {
      throw new NoFileException('No files available!');
    }

    return await files.map(file => {
      const src = `${this.SERVER_URL}pages/${file.path}`;
      const { filename } = file;

      return { src, filename };
    });
  }

  // PUT Update an existing post
  public async updatePage(id, body: Partial<UpdatePageDTO>, user: User): Promise<PageEntity> {
    const foundPage = await this.getSinglePost(id);
    const { title, name, isPublished, content, description, deletedGalleryImages, gallery } = body;

    if(!!title) {
      foundPage.title = title;
    }

    if(!!name) {
      foundPage.name = name;
    }

    if(!!content) {
      foundPage.content = content;
    }

    if(!!description) {
      foundPage.description = description;
    }

    if(!!isPublished) {
      foundPage.isPublished = !!isPublished;
    }

    if(!!gallery && gallery.length > 0) {
      const arrGallery = gallery.map(image => {
        if(image.hasOwnProperty('id')) {
          return image;
        }

        const newImg =  new GalleryImageEntity();
  
        newImg.filename = image.filename;
        newImg.src = image.src;
  
        return newImg;
      });
  
      foundPage.gallery = Promise.resolve(arrGallery);
    }

    const saved = await this.pagesRepository.save(foundPage);

    // Deleting images form the db and also from the server 

    if(!!deletedGalleryImages && deletedGalleryImages.length > 0) {
      await this.galleryImageRepository.remove(deletedGalleryImages);

      deletedGalleryImages.forEach(image => {
        this.deleteImageFile(image);
      });
    }

    return saved;
  }

  // DELETE an existing post
  public async deletePage(id: string, user: User): Promise<PageEntity> {
    const foundPage = await this.getSinglePost(id);
    await this.pagesRepository.remove(foundPage);

    // Deleting gallery img files
    for (const image of foundPage['__gallery__']) {
      this.deleteImageFile(image);
    }

    return foundPage;
  }

  // Delete image file on the server
  private deleteImageFile(file): void {
    fs.unlink(`./postImages/${file.filename}`, (err) => {
      if(err) {
        console.error(err);
        return;
      }
    });
  }
}  
