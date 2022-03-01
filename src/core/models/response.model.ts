import { IError } from './error.model';

export class ResponseModel {
    dbSys: string;
    isJson: boolean;
    error: IError;
    msgBodyData: Array<any>;

    private readIndex = 0;

    constructor(init?: Partial<Response>) {
        Object.assign(this, init);
    }

    read<T>(): T {
        let value = null;
        if (this.msgBodyData && this.msgBodyData.length > this.readIndex) {
            value = this.msgBodyData[this.readIndex];
            this.readIndex++;
        }

        if (value) {
            return value as T;
        }

        return null;
    }
}
