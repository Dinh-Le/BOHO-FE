import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable, map } from 'rxjs';
import { JWTTokenService } from '../services/jwt-token.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private excludeUrls: Set<string> = new Set(['/api/rest/v1/login']);

  constructor(private tokenService: JWTTokenService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !req.url.startsWith(environment.baseUrl) ||
      this.excludeUrls.has(req.url)
    ) {
      return next.handle(req);
    }

    if (this.tokenService.isExpired) {
      // this.router.navigateByUrl('/login');
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${this.tokenService.token}` },
    });

    return next.handle(authReq);
    // return next.handle(authReq).pipe(
    //   // Bug: The get users API returns sucessfully, but the `success` field is false
    //   // Workaround: set the `success` field to true if the message field is `Successfully`
    //   map((event) => {
    //     if (event instanceof HttpResponse && typeof event.body === 'object' && event.body.message.includes('uccessful')) {
    //       return event.clone({
    //         body: Object.assign({}, event.body, {
    //           success: true,
    //         }),
    //       });
    //     } else {
    //       return event;
    //     }
    //   })
    // );
  }
}
