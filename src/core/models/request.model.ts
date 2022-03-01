import { UploadFile } from "./uploadfile";

export class RequestModel {
  isJson: boolean;
  dbSytem: string;
  connectionName: string;
  msgBodyData: Array<any>;
  service: string;
  assemblyName: string;
  className: string;
  methodName: string;
  tenant: string;
  uploadFiles: Array<UploadFile>;
}
