import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Food } from '../models/food.model';

@Injectable({
  providedIn: 'root'
})
export class FoodsApiService {
  private baseUrl = 'https://foodsapi.cloudcomputingassociates.net:8080/api/v1';

  constructor(private http: HttpClient) { }

  searchFoods(query: string): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}`);
  }
}
