import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodsApiService {
  private baseUrl = 'https://foodsapi.cloudcomputingassociates.net:4443/api/v1';

  constructor(private http: HttpClient) { }

  searchFoods(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}`);
  }

  hasBrandLinks(food: any): boolean {
    return !!(
      food?.brandInfo?.nutritionSiteCandidates?.length || 
      food?.brandInfo?.productImageSiteCandidates?.length
    );
  }
}