import { IsString, Length } from "class-validator";
import { GalleryImageEntity } from "../../data/entities/gallery-image";

export class UpdatePageDTO {

    @IsString()
    @Length(5, 100)
    title: string;

    @IsString()
    @Length(3, 30)
    name: string;

    @IsString()
    @Length(15, 10000)
    content: string;

    @IsString()
    @Length(5, 1000)
    description: string;
    
    isPublished?: boolean;
    gallery?: any[];
    deletedGalleryImages?: GalleryImageEntity[];
}