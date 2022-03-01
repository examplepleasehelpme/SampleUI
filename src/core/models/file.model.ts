import { Permission } from "@modules/dm/services/_models/file.model";

export class FileUpload {
    fileName: string;
    avatar: string;
    thumbnail: string;
    userName: string;
    uploadDate: any;
    extension: string;
    size: any;
    type: any;
    fullName: string;
    tags: any;
    subject: any;
    objectType: any;
    objectID: any;
    funcId: any;
    language: any;
    description: string;
    author: string;
    publisher: string;
    publisherYear: any;
    publisherDate: any;
    copyright: string;
    data: string;
    folderId: string;
    permission: Permission[];
}
