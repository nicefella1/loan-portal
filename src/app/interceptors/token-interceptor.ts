import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private service: AuthService) {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.service.isLoggedIn()) {
            const token = this.service.getAuthToken();
            req = req.clone({
                setHeaders: {
                    Authorization: token
                }
            });
        }
        return next.handle(req).pipe(tap((data: any) => {
            if (data.body) {
                if (data.body.status === 'error' && data.body.message === 'Authorization Failed, Please login to continue') {
                    this.service.logOut();
                }
            }
        }));
    }
}
