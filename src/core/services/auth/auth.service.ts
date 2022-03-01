import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UserModel } from '../../models';
import { AESCryptoService } from '../aescrypto/aescrypto.service';
import { ApiHttpService } from '../apihttp/apihttp.service';
import { TenantStore } from '../tenant/tenant.store';
import { AuthStore } from './auth.store';
import { CacheService } from '../cache/cache.service';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // public fields
  private userSubject: BehaviorSubject<UserModel>;
  public user$: Observable<UserModel>;
  public isLoadingSubject: BehaviorSubject<boolean>;
  public isLoading$: Observable<boolean>;

  constructor(
    private router: Router,
    private api: ApiHttpService,
    private tenantStore: TenantStore,
    private authStore: AuthStore,
    private aesCrypto: AESCryptoService,
    private cache: CacheService,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
    this.userSubject = new BehaviorSubject<UserModel>(this.authStore.get());
    this.user$ = this.userSubject.asObservable();
  }

  get userValue(): UserModel {
    return this.userSubject.value;
  }

  set userValue(user: UserModel) {
    this.userSubject.next(user);
  }

  // public methods
  login(userName: string, password: string): Observable<any> {
    this.isLoadingSubject.next(true);
    userName = this.aesCrypto.encrypt(userName);
    password = this.aesCrypto.encrypt(password);
    return this.api.execSv<UserModel>('Auth', 'ERM.Business.AD', 'UsersBusiness', 'LoginAsync', [userName, password, '', environment.FCMToken]).pipe(
      map(user => {
        if (!user) { return null; }
        this.userSubject.next(user);
        this.startRefreshTokenTimer();
        this.authStore.set(user);
        return user;
      }),
      catchError(err => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  changepw(userName: string, passwordold: string, passwordnew: string): Observable<any> {
    userName = this.aesCrypto.encrypt(userName);
    passwordold = this.aesCrypto.encrypt(passwordold);
    passwordnew = this.aesCrypto.encrypt(passwordnew);
    return this.api.execSv<UserModel>('Auth', 'ERM.Business.AD', 'UsersBusiness', 'ChangePasswordAsync', [userName, passwordold, passwordnew, null]).pipe(
      map(data => {
        if (!data) { return null; }
        return data;
      }),
      catchError(err => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout(url: string = null) {
    const t = this;
    function lo() {
      t.stopRefreshTokenTimer();
      t.authStore.remove();
      t.userValue = null;
      //t.cache.disconectToDB(); // test
      const tenant = t.tenantStore.getName();
      t.router.navigate([`/${tenant}/auth/login`], { queryParams: { returnUrl: url } });
      return;
    }

    if (!this.userValue) {
      return lo();
    }

    this.api.callSv('Auth', 'ERM.Business.AD', 'UsersBusiness', 'LogoutAsync').subscribe();
    return lo();
  }

  clearCache(): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.api.execSv<any>("SYS", "ERM.Business.CM", "CMBusiness", "InitCacheServicesAsync", [""]).pipe(
      map(data => {
        if (!data) { return null; }
        return data;
      }),
      catchError(err => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  getUserByToken(): Observable<UserModel> {
    const tenant = this.tenantStore.getName();
    if (environment.isDesign) {
      const user = new UserModel();
      user.userName = 'test';
      user.email = 'test@lacviet.com.vn';
      user.tenant = tenant;
      user.tokenExpire = '2099-12-31 23:59';
      this.authStore.set(user);
      return of(user);
    }

    this.isLoadingSubject.next(true);

    const url = location.href;


    return this.api.get(`auth/init?tenant=${tenant}`).pipe(
      map((data) => {
        if (!data) { return null; }

        environment.dfPe = data.pe;
        if (data.user) {
          this.userSubject = new BehaviorSubject<UserModel>(data.user);
          this.authStore.set(data.user);
          if (url.indexOf('/auth/login') > 0) {
            return this.router.navigate(['/']);
          }

        } else if (url.indexOf('/auth/login') < 0) {
          this.logout();
          return null;
        }
        return data.user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  refreshToken() {
    return this.api.exec<UserModel>('ERM.Business.Tenant', 'TenantBusiness', 'RefreshTokenAsync').pipe(
      map((user) => {
        if (user) {
          this.authStore.set(user);
        } else {
          this.logout();
        }
      })
    );
  }

  private refreshTokenTimeout;
  private startRefreshTokenTimer() {
    // set a timeout to refresh the token a minute before it expires
    /*const expires = this.userValue.tokenExpire;//new Date(this.userValue.expired * 1000);
    let dtexpires: Date;
    if (typeof (expires) == 'string') {
        dtexpires = new Date(expires);
    } else {
        dtexpires = expires;
    }

    const timeout = dtexpires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    */
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) clearTimeout(this.refreshTokenTimeout);
  }

  checkUserStatus() {
    const tenant = this.tenantStore.getName();
    const isExp = this.authStore.checkTokenExp();

    let usr = this.userValue;
    if (!usr) {
      this.userValue = this.authStore.get();
      usr = this.userValue;
    }

    return isExp && tenant == usr?.tenant;
  }
}
