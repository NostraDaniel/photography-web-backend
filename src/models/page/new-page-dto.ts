import { IsString,IsNotEmpty, Length } from "class-validator";

export class NewPageDTO {
    @IsNotEmpty()
    @IsString()
    @Length(3, 30)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Length(5, 100)
    title: string;

    @IsNotEmpty()
    @IsString()
    @Length(15, 10000)
    content: string;

    @IsNotEmpty()
    @IsString()
    @Length(5, 1000)
    description: string;
    
    isPublished?: boolean;
    gallery?: any[];
}