import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { UserModel } from '../../models';
import { AESCryptoService } from '../aescrypto/aescrypto.service';
import { TenantStore } from '../tenant/tenant.store';

@Injectable({
    providedIn: 'root',
})
export class AuthStore {
    // public fields
    constructor(
        private aesCrypto: AESCryptoService,
        private tenantStore: TenantStore
    ) {}

    // private methods
    set(user: UserModel){
        if (user) {
            const key = this.tenantStore.getKey(user.tenant);

            let us = JSON.stringify(user);
            us = this.aesCrypto.encode(us);
            localStorage.setItem(key, us);
        }
    }

    get(): UserModel {
        try {
            const key = this.tenantStore.getKey();

            let sUs = localStorage.getItem(key);
            if (!sUs) { return undefined; }

            sUs = this.aesCrypto.decode(sUs);
            return JSON.parse(sUs);
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    remove() {
        const key = this.tenantStore.getKey();
        localStorage.removeItem(key);
    }

    checkTokenExp() {
        return moment().isBefore(this.getExpiration());
    }

    private getExpiration() {
        const user = this.get();
        return moment(user?.tokenExpire);
    }
}
