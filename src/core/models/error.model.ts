export interface IError {
    isError: boolean;
    isSystemError: boolean;
    errorCode: string;
    errorTitle: string;
    errorMessage: string;
    stackTrace: string;
    MmssgType: string;
    entityName: string;
    propertyName: string;
    propertyValue: string;
    subErrorList: IError[];
}