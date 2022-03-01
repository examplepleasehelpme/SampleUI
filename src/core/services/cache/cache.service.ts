import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import { ApiHttpService } from '@core/services';
import { AuthStore } from '../auth/auth.store';
import 'lodash';
import { Subject } from 'rxjs';

declare var _;
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private stores = {};
  // private _db: any;
  // private _dataChange: Subject<any> = new Subject<any>();
  // storeNames = ['FormLabels', 'SYS_GridViews', 'SYS_GridViewSetup', 'TranslateLabel', 'SYS_ComboboxList', 'ValueListDatas', 'ComboBoxDatas', 'Images', 'SYS_FunctionList', 'SYS_ParentFunctionList'];
  constructor(private auth: AuthStore,
    private api: ApiHttpService) {
    //this.connDB();
  }

  // connDB() {
  //   const t = this;
  //   this._db = openDB('ERMDb', 1, {
  //     upgrade(db) {
  //       t.storeNames.forEach((e) => {
  //         db.createObjectStore(e);
  //       })
  //     },
  //   });
  // }

  // disconectToDB() {
  //   //deleteDB('ERMDb');
  //   // var arrObj = ['FormLabels', 'GridViewSetups', 'ComboBoxSettings', 'ValueListDatas', 'ComboBoxDatas', 'SYS', 'Images'];
  //   // //deleteDB('ERM');
  //   // var t = this;
  //   // arrObj.forEach(item => {
  //   //   t.clear(item);
  //   // });
  // }


  // clear(storName) {
  //   return this._db.then((db: any) => {
  //     const tx = db.transaction(storName, 'readwrite');
  //     if (!tx) return;

  //     const store = tx.objectStore(storName);
  //     store.clear();
  //   }).catch(err => console.log(err));
  // }

  getStore(storeName): Promise<any> {
    return new Promise((resolve, reject) => {
        var store =this.stores[storeName];
        if(!store)
        {
          store = {};
          this.stores[storeName] = store;
        }
        resolve(store);
    });
    // return this._db.then((db: any) => {
    //   if (!db.objectStoreNames.contains(storeName)) {
    //     this._db = openDB('ERMDb', db.version, {
    //       upgrade(db2) {
    //         // Create a store of objects
    //         return db2.createObjectStore(storeName);
    //       },
    //     });

    //     return this._db.then(db1 => {
    //       const tx = db1.transaction(storeName, 'readwrite');
    //       return tx.objectStore(storeName);
    //     });

    //     // return db.createObjectStore(storeName, {autoIncrement: true});
    //   } else {
    //     const tx = db.transaction(storeName, 'readwrite');
    //     return tx.objectStore(storeName);
    //   }
    // });
  }

  // get(storeName: string, key: string) {
  //   return this._db.then((db: any) => {
  //     const tx = db.transaction(storeName, 'readonly');
  //     const store = tx.objectStore(storeName);
  //     return store.get(key);
  //   }).catch(err => console.log(err));
  // }

  getCache(storeName, key, params): Promise<any> {
    // if (!this._db) return;
    const user = this.auth.get();
    if (!user) return;

    key += '|' + user.userID;

    return this.getStore(storeName).then((store: any) => {
      // return store.get(key).then(data => {
      var data = null;
      if(!store){
        data = store[key];
      }

        if (data != null || storeName === "Images") return data;

        return this.api.callSv('SYS', 'CM', 'CMBusiness', 'GetCacheAsync', params).toPromise().then(res => {
          if (res && res.msgBodyData[0]) {
            const datas = res.msgBodyData[0];
            this.add(storeName, key, datas);
            return datas;
          }
        });
      // });
    });
  }

  // getAllData(storeName: string) {
  //   return this._db.then((db: any) => {
  //     const tx = db.transaction(storeName, 'readonly');
  //     const store = tx.objectStore(storeName);
  //     return store.getAll();
  //   });
  // }


  add(storeName, key, data): Promise<void> {
    return this.getStore(storeName).then(store => {
      store[key]=data;
      //store.put(data, key);
    });
  }

  // addItems(storeName: string, key: string, value: any) {
  //   this._db.then((db: any) => {
  //     const tx = db.transaction(storeName, 'readwrite');
  //     tx.objectStore(storeName).put(value, key);
  //     this.getAllData(storeName).then((items: any) => {
  //       this._dataChange.next(items);
  //     });
  //     return tx.complete;
  //   });
  // }

  delete(storeName, key) {
    var store = this.stores[storeName];
    if(store)
      delete store[key];
    // return this._db.then(db => {
    //   const tx = db.transaction(storeName, 'readwrite');
    //   tx.objectStore(storeName).delete(key);
    //   return tx.complete;
    // });
  }

  formLabel(formName): Promise<any> {
    const storeName = 'TranslateLabel';

    return this.getCache(storeName, formName, [storeName, formName]);
  }

  sysLabel(): Promise<any> {
    return this.formLabel('SystemLabel');
  }

  message(code): Promise<any> {
    const storeName = 'SYS_Messages';

    return this.getCache(storeName, code, [storeName, code]);
  }

  functionList(key): Promise<any> {
    const storeName = 'SYS_FunctionList';

    return this.getCache(storeName, key, [storeName, key]);
  }

  addFuncList(key, data) {
    const storeName = 'SYS_FunctionList';

    //if (!this._db) return;
    const user = this.auth.get();
    if (!user) return;

    key += '|' + user.userID;

    return this.add(storeName, key, data);
  }

  moreFunction(formName, gridName): Promise<any> {
    const storeName = 'SYS_MoreFunctions';

    return this.getCache(storeName, formName + '|' + gridName, [storeName, formName, gridName]);
  }

  gridView(gridName): Promise<any> {
    const storeName = 'SYS_GridViews';

    return this.getCache(storeName, gridName, [storeName, gridName]);
  }

  gridViewSetup(formName, gridName): Promise<any> {
    const storeName = 'SYS_GridViewSetup';

    return this.getCache(storeName, formName + '|' + gridName, [storeName, formName, gridName]);
  }

  combobox(name): Promise<any> {
    const storeName = 'SYS_ComboboxList';

    return this.getCache(storeName, name, [storeName, name]);
  }

  valueList(name): Promise<any> {
    const storeName = 'SYS_ValueList';

    return this.getCache(storeName, name, [storeName, name]);
  }

  getValueListDatas(name): Promise<any> {
    const storeName = 'ValueListModel';

    return this.getCache(storeName, name, [storeName, name]);
  }

  getBindingVLL(key, value, type = "name"): Promise<any> {
    return this.getValueListDatas(key).then(res => {
      var data = _.find(res, { 'value': value })
      return data && data[type] ? data[type] : "";
    }).catch(err => console.log(err));
  }
}