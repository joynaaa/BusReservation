import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AiService {


  private apiUrl =
    'http://127.0.0.1:8000/api/ai';


  constructor(
    private http: HttpClient
  ) {}


  sendMessage(
    message: string,
    context: any = {}
  ): Observable<any> {


    const token =
      localStorage.getItem(
        'access'
      );


    const headers =
      new HttpHeaders({

        'Authorization':
          `Bearer ${token}`,

        'Content-Type':
          'application/json'

      });


    return this.http.post(

      `${this.apiUrl}/chat/`,

      {

        message: message,

        context: context

      },

      {
        headers: headers
      }

    );

  }

}