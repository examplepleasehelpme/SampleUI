import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { ITenant, ApiHttpService } from '..';
import { TenantStore } from './tenant.store';

const addPath = (urlAndQuery: string[]) => urlAndQuery[0] ? '/' + urlAndQuery[0] : '';
const addQuery = (urlAndQuery: string[]) => urlAndQuery[1] ? '?' + urlAndQuery[1] : '';

@Injectable({
    providedIn: 'root',
})
export class TenantService {
    // public fields
    constructor(
        private api: ApiHttpService,
        private tenantStore: TenantStore
    ) { }

    init(router: Router) {
        return router.events.pipe(
            filter((event: RouterEvent) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                const url = event.url === '/' ? '' : event.url;

                const urlAndQuery = url.split('?');
                const pathMap = urlAndQuery[0].split('/');

                const firstPathPart = pathMap[1];

                if (!firstPathPart) {
                    const oTenant = this.tenantStore.get();
                    let tenant = oTenant?.tenant;

                    if (!tenant) {
                        tenant = this.tenantStore.defaultTenant;
                    }

                    const redirectUrl = '/' + tenant + addPath(urlAndQuery) + addQuery(urlAndQuery);
                    router.navigate([redirectUrl]);
                    return;
                }

                this.check(firstPathPart).subscribe(data => {
                    if (data) {
                        this.tenantStore.activeTenant = firstPathPart;
                    } else {
                        this.tenantStore.activeTenant = this.tenantStore.defaultTenant;
                        let redirectUrl = '/' + this.tenantStore.activeTenant + addPath(urlAndQuery) + addQuery(urlAndQuery);
                        redirectUrl = redirectUrl.replace('/' + firstPathPart + '/', '');
                        router.navigate([redirectUrl]);
                    }
                });
            });
    }


    check(tentant) {
        if (tentant == this.tenantStore.defaultTenant) {
            this.tenantStore.activeTenant = this.tenantStore.defaultTenant;
            const oTn: ITenant = {
                tenant: tentant,
                status: 1,
            };

            this.tenantStore.set(oTn);
            return of(tentant);
        }
        else if (tentant == this.tenantStore.activeTenant) {
            const oTn: ITenant = {
                tenant: tentant,
                status: 1
            };
            return of(tentant);
        }
        else {
            let tn = this.tenantStore.get();
            if (tn && tn.tenant == tentant) {
                const oTn: ITenant = {
                    tenant: tentant,
                    status: 1
                };
                return of(tentant);
            }

            return this.api.exec<boolean>('ERM.Business.Tenant', 'TenantsBusiness', 'ExistsTenantAsync', tentant).pipe(
                map((ok) => {
                    if (ok) {
                        const oTn: ITenant = {
                            tenant: tentant,
                            status: 1
                        };

                        this.tenantStore.set(oTn);
                        return oTn?.tenant;
                    }
                }),
                catchError((err, caught) => {
                    return '';
                })
            );
        }
    }
}
