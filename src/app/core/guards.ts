import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { JWTTokenService } from './services/jwt-token.service';
import { inject } from '@angular/core';

export const isAuthenticated: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  if (inject(JWTTokenService).isExpired) {
    inject(Router).navigateByUrl('/login');
    return false;
  } else {
    return true;
  }
};

export const anonymous: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => true;
