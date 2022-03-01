import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  Router,
} from '@angular/router';
import { Observable, of, pipe } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../apihttp/apihttp.service';
import { CacheService } from '../cache/cache.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private api: ApiHttpService,
    private cache: CacheService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkFunc(state.url, route.params.id);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkFunc(state.url, route.params.id);
  }

  canLoad(route: Route): Observable<boolean> {
    return this.checkFunc();
  }

  private checkLogin(url: string = null): boolean {
    if (this.authService.checkUserStatus()) { return true; }

    this.authService.logout(url);
    return false;
  }

  public checkFunc(url: string = null, funcId: string = null): Observable<boolean> {
    var isOK = this.checkLogin(url);
    if (isOK && funcId) {
      var id = funcId;
      return this.api.exec<any>('SYS', 'FunctionListBusiness', 'GetWithPerAsync', funcId).pipe(map(f => {
        if (f == null) {

          this.router.navigate(["/AuthFunction/" + funcId]);
          return false;
        }

        this.cache.addFuncList(funcId, f);
        return true;
      }));
    }

    return of(isOK);
  }
}
