import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor() {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.includes('loans/upload')) {
            req.headers.delete('content-type');
        } else {
            req = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json',
                }
            });
        }
        return next.handle(req);
    }
}
