import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel, UploadFile } from 'src/core/models';
import { AuthStore } from '../auth/auth.store';

@Injectable({
  providedIn: 'root'
})

export class ApiHttpService {
  entityName = "";
  formName = "";
  gridViewName = "";
  constructor(private http: HttpClient,
    private authStore: AuthStore) { }

  call(assemply: string, className: string, methodName: string, data: any = null, uploadFiles: UploadFile[] = null) {
    return this.callSv('', assemply, className, methodName, data, uploadFiles);
  }

  callSv(service: string, assemply: string, className: string, methodName: string, data: any = null, uploadFiles: UploadFile[] = null) {
    return this.postSv(service, assemply, className, methodName, data, uploadFiles);
  }

  exec<T>(assemply: string, className: string, methodName: string, data: any = null, uploadFiles: UploadFile[] = null) {
    return this.execSv<T>('', assemply, className, methodName, data, uploadFiles);
  }

  execSv<T>(service: string, assemply: string, className: string, methodName: string, data: any = null, uploadFiles: UploadFile[] = null) {
    return this.postSv(service, assemply, className, methodName, data, uploadFiles).pipe(
      map((res: ResponseModel) => {
        return res?.read<T>();
      })
    );
  }
  execNonDB<T>(assemply: string, className: string, methodName: string, data: any = null, uploadFiles: UploadFile[] = null) {
    return this.execSvNonDB<T>('', assemply, className, methodName, data, uploadFiles);
  }

  execSvNonDB<T>(service: string, assemply: string, className: string, methodName: string, data: any = null, uploadFiles: UploadFile[] = null) {
    return this.postSvNonDB(service, assemply, className, methodName, data, uploadFiles).pipe(
      map((res: ResponseModel) => {
        return res?.read<T>();
      })
    );
  }
  getService(assemply: string) {
    let service = assemply;
    const idx = assemply.lastIndexOf('.');
    if (idx >= 0) {
      service = assemply.substr(idx + 1);
    }

    if (service == 'AD') {
      service = 'SYS';
    }

    return service;
  }

  get(url: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/${url}`).pipe(
      map((reponse) => {
        return reponse;
      })
    );
  }

  post(url: string = null, data: any = null): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/${url}`, data).pipe(
      map((reponse) => {
        return reponse;
      })
    );
  }

  private postSv(
    service: string,
    assemply: string,
    className: string,
    methodName: string,
    data: any,
    uploadFiles: UploadFile[],
  ): Observable<ResponseModel> {
    return this._postSv(service, assemply, className, methodName, data, uploadFiles, 'exec');
  }
  private postSvNonDB(
    service: string,
    assemply: string,
    className: string,
    methodName: string,
    data: any,
    uploadFiles: UploadFile[],
  ): Observable<ResponseModel> {
    return this._postSv(service, assemply, className, methodName, data, uploadFiles, 'ExecNonDB');
  }
  private _postSv(
    service: string,
    assemply: string,
    className: string,
    methodName: string,
    data: any,
    uploadFiles: UploadFile[],
    action: string
  ): Observable<ResponseModel> {
    if (!service) service = this.getService(assemply);
    const url = `${service}/${action}`;

    if (data !== null && data !== undefined && !Array.isArray(data)) {
      data = [data];
    }

    const request: any = {
      isJson: true,
      service,
      assemblyName: assemply,
      className,
      methodName,
      msgBodyData: data
    };

    if (uploadFiles) {
      request.uploadFiles = uploadFiles;
    }

    const user = this.authStore.get();
    if (user) {
      request.userID = user.userID;
      request.bUID = user.bUID;
      request.tenant = user.tenant;
    } else {
      request.tenant = this.getTenantUrl();
    }
    if (this.entityName)
      request.entityName = this.entityName;
    if (this.formName)
      request.formName = this.formName;
    if (this.gridViewName)
      request.gridViewName = this.gridViewName;

    var funcID = this.getUrlVars()["funcID"];
    if (funcID)
      request.functionID = funcID;

    return this.post(url, request).pipe(
      map((response) => {
        const resp = new ResponseModel(response);
        return resp;
      })
    );
  }

  getTenantUrl() {
    const path = location.pathname.match(/[^/]+/g);
    const tenant = path && path.length > 0 ? path[0] : '';
    return tenant;
  }


  execAction(entityName: string, data: any, methodName: string, formName: string = "", gridViewName: string = "", service: string = "", assemply: string = "", className: string = "", uploadFiles: UploadFile[] = null) {
    if (!entityName) return;
    this.entityName = entityName;
    var arObj = entityName.split("_");
    if (!service) {
      service = arObj[0];
      if (service == "AD")
        service = "SYS";
    }
    if (!formName)
      this.formName = formName = arObj[1];
    if (!gridViewName)
      this.gridViewName = gridViewName = "grv" + arObj[1];
    if (!assemply)
      //assemply = "ERM.Common.Services";
      assemply = "ERM.Business." + service;
    return this.callSv(service, assemply, "ERM.BaseFunction", methodName, [data], uploadFiles);
    //return this._postSv(service, assemply, className, methodName, data, uploadFiles, 'Save');
  }

  getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }
}
