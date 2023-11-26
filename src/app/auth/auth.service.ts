import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { User } from "./user.model";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    user = new BehaviorSubject<User>(null);
    token: string = null;
    apiKey = ''
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient, private router: Router) { }

    logout() {
        this.user.next(null);
        this.token = null;
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    signup(email: string, password: string) {
        return this.http.post(environment.HOST_URL + '/users',
        {
            email: email,
            password: password,
        }
        )
    }

    login() {
        return this.http.get(environment.HOST_URL + '/users')
    }

    setItemInSessionStorage(userData:any){
        sessionStorage.setItem("user",JSON.stringify(userData));
    }

    autoLogin() {
        // const userData: {
        //     email: string;
        //     id: string;
        //     _token: string;
        //     _tokenExpirationDate: string;
        // } = JSON.parse(localStorage.getItem('userData'));
        // if (!userData) {
        //     return;
        // }

        // const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

        // if (loadedUser.token) {
        //     this.user.next(loadedUser);
        //     const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        //     this.autoLogout(expirationDuration);
        // }
        const user = sessionStorage.getItem('user');
        if(!user){
            
        }else{
            this.router.navigate(['/recipes']);
        }
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: any) {
        let errorMessage = 'An unknown error occurred!';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email does not exist';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'This password is not correct';
                break;
        }
        return throwError(errorMessage);
    }
}