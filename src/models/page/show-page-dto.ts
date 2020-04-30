import { ShowImageDTO } from "./show-image-dto";
import { User } from "../../data/entities/user";

export class ShowPageDTO {
    id: string;
    title: string;
    description: string;
    content: string;
    isPublished: boolean;
    gallery?: Promise<ShowImageDTO[]>;
    author: Promise<User>;
    createdOn: Date;
}