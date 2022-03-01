import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AESCryptoService } from '../aescrypto/aescrypto.service';
import { ITenant } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class TenantStore {
  private tnKey = `${environment.appVersion}-${environment.TNDATA_KEY}`;
  private lsKey = `${environment.appVersion}-`;
  public defaultTenant = 'default';
  public activeTenant = 'default';

  // public fields
  constructor(
    private aesCrypto: AESCryptoService
  ) { }

  set(tenant: ITenant) {
    if (tenant) {
      let tn = JSON.stringify(tenant);
      tn = this.aesCrypto.encode(tn);
      localStorage.setItem(this.tnKey, tn);
    }
  }

  get(): ITenant {
    try {
      let tn = localStorage.getItem(this.tnKey);
      if (!tn) { return undefined; }

      tn = this.aesCrypto.decode(tn);
      return JSON.parse(tn);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  getName(isUrl = true) {
    if (isUrl) {
      const path = location.pathname.match(/[^/]+/g);
      let tenant = path && path.length > 0 ? path[0] : '';

      if (!tenant) {
        const oTenant = this.get();
        tenant = oTenant?.tenant;
      }

      if (!tenant) {
        tenant = this.defaultTenant;
      }

      return tenant;
    } else {
      const oTenant = this.get();

      if (oTenant?.tenant) {
        return oTenant.tenant;
      } else {
        const path = location.pathname.match(/[^/]+/g);
        let tenant = path && path.length > 0 ? path[0] : '';

        if (!tenant) {
          tenant = this.defaultTenant;
        }

        return tenant;
      }
    }
  }

  getKey(tn: string = null) {
    if (!tn) {
      tn = this.getName(false);
    }

    tn = this.aesCrypto.encode(tn);
    return `${this.lsKey}${tn}`;
  }
}
