import { Controller, Get, Post, Query, Param, Put, UseGuards, Body, ValidationPipe, Delete, UseInterceptors, UploadedFile, Res, UploadedFiles, UseFilters, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewPageDTO } from '../models/page/new-page-dto';
import { User } from '../data/entities/user';
import { AuthUser } from '../common/decorators/user.decorator';
import { PagesService } from './pages.service';
import { diskStorage } from  'multer';
import { extname } from  'path';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ShowImageDTO } from '../models/page/show-image-dto';
import { PageEntity } from '../data/entities/page';
import { UploadedFileImageDTO } from '../models/page/uploaded-file-image-dto';
import { CommonExceptionFilter } from '../common/filters/common-exception.filter';
import { ValidationExceptionFilter } from '../common/filters/validation-exception.filter';
import { UpdatePageDTO } from '../models/page/update-page-dto';

@Controller('pages')
@UseFilters(new CommonExceptionFilter())
export class PagesController {

  constructor(
    private readonly pagesService: PagesService,
  ) {}
  
  // Get posts by page, posts per page and filter
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Query('page') page: number,
    @Query('posts_per_page') postsPerPage: number,
    @Query('filter') filter: string
    ): Promise<{pagesCount: number,pages:PageEntity[]}> {
    return await this.pagesService.getAllPages(page, postsPerPage, filter);
  }

  // Creates pages with validation
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new ValidationExceptionFilter())
  @HttpCode(HttpStatus.CREATED)
  async createNewPage
    (
      @Body(new ValidationPipe({
        transform: true,
        // whitelist: true,
      })) pageBody: NewPageDTO,
      @AuthUser() user: User
    ): Promise<PageEntity> {
    console.log('tqloto na page', pageBody);
    return await this.pagesService.createNewPage(pageBody, user);
  }

  @Put(':PageId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public async updatePage(
    @Param('PageId') id: string,
    @Body(new ValidationPipe({
    })) body: UpdatePageDTO,
    @AuthUser() user: User): Promise<PageEntity> {
    return await this.pagesService.updatePage(id, body, user);
  }

  @Delete(':PageId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public async deletePost(@Param('PageId') id: string, @AuthUser() user: User): Promise<PageEntity> {
    return await this.pagesService.deletePage(id, user);
  }

  @Get(':pageId')
  // @HttpCode(HttpStatus.FOUND)
  public async getSinglePage(@Param('pageId') id: string): Promise<any> {
    console.log(id);
    return await this.pagesService.getSinglePost(id);
  }

  @Post('image')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image',
    {
      storage: diskStorage({
        destination: './pageImages', 
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');

          return cb(null, `${randomName}${extname(file.originalname)}`)
        },
        limits: {
          fileSize: 10
        }
      })
    }
  ))
  public async uploadImage(@UploadedFile() file): Promise<UploadedFileImageDTO> {
    return this.pagesService.uploadImage(file);
  }

  @Post('images')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('gallery[]',12,{
    storage: diskStorage({
      destination: './pageImages',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');

          return cb(null, `${randomName}${extname(file.originalname)}`)
      },
      limits: {
        fileSize: 10
      }
    })
  }))
  public async uploadImages(@UploadedFiles() files): Promise<ShowImageDTO[]> {
    return this.pagesService.uploadImages(files);
  }

  @Get('pageImages/:fileId')
  @HttpCode(HttpStatus.FOUND)
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: 'pageImages'});
  }
}
