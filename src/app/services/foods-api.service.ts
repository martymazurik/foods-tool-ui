import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ImageUploadResponse {
  success: boolean;
  nutritionImageUploaded: boolean;
  productImageUploaded: boolean;
  nutritionFactsStatus?: string;
  message: string;
  warnings?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FoodsApiService {
  private baseUrl = environment.apiUrl;  // Now uses environment config

  constructor(private http: HttpClient) { }

  searchFoods(query: string, limit?: number): Observable<any> {
    let url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}`;
    if (limit !== undefined && limit !== null) {
      url += `&limit=${limit}`;
    }
    return this.http.get<any>(url);
  }

  // Added refresh method for image upload component
  refreshFood(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}`);
  }

  // NEW: Upload images method
  uploadImages(query: string, formData: FormData): Observable<ImageUploadResponse> {
    return this.http.put<ImageUploadResponse>(
      `${this.baseUrl}/foods/images?query=${encodeURIComponent(query)}`,
      formData
    );
  }

  // Helper method to check if food has brand links
  hasBrandLinks(food: any): boolean {
    if (!food?.brandInfo) {
      return false;
    }
    
    const nutritionLinks = food.brandInfo.nutritionSiteCandidates || [];
    const productLinks = food.brandInfo.productImageSiteCandidates || [];
    
    return nutritionLinks.length > 0 || productLinks.length > 0;
  }

  // NEW: Helper method to get image URL (for displaying existing images)
  getImageUrl(objectId: string): string {
    return `${this.baseUrl}/images/${objectId}`;
  }
}