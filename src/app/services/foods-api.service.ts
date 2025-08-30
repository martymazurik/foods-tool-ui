import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

@Injectable({
  providedIn: 'root'
})
export class FoodsApiService {
  private baseUrl = 'https://foodsapi.cloudcomputingassociates.net:4443/api/v1';
  private ajv: Ajv;
  private validateFood: any = null;

  constructor(private http: HttpClient) {
    // Initialize AJV with format validation
    this.ajv = new Ajv({ 
      allErrors: true,
      strict: false  // Allow unknown formats/keywords
    });
    addFormats(this.ajv);
    
    // Load schema from assets at runtime
    this.loadSchema();
  }

  private async loadSchema() {
    try {
      const response = await fetch('/assets/schemas/food.schema.json');
      const schema = await response.json();
      this.validateFood = this.ajv.compile(schema);
      console.log('Schema validator initialized successfully');
    } catch (error) {
      console.error('Failed to load schema:', error);
      this.validateFood = null;
    }
  }

  searchFoods(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}`)
      .pipe(
        map(food => {
          // Validate against schema
          if (this.validateFood) {
            const isValid = this.validateFood(food);
            
            if (!isValid) {
              // Log detailed schema violations to console
              console.group('🚨 SCHEMA VALIDATION FAILED for API response');
              console.error('Food data received:', food);
              console.error('Schema violations:');
              
              if (this.validateFood.errors) {
                this.validateFood.errors.forEach((error: any) => {
                  console.error(`  • Field: ${error.instancePath || 'root'}`);
                  console.error(`    Problem: ${error.message}`);
                  console.error(`    Expected: ${JSON.stringify(error.params)}`);
                  console.error(`    Received: ${JSON.stringify(error.data)}`);
                  console.error('    ---');
                });
              }
              
              console.error('Full AJV error details:', this.ajv.errorsText(this.validateFood.errors));
              console.groupEnd();
              
              // Still return the data but mark it as invalid
              (food as any).__schemaValid = false;
            } else {
              console.log('✅ API response passed schema validation');
              (food as any).__schemaValid = true;
            }
          } else {
            console.warn('⚠️ Schema validator not available - skipping validation');
          }

          return food;
        }),
        catchError(error => {
          console.error('❌ API request failed:', error);
          throw error;
        })
      );
  }

  hasBrandLinks(food: any): boolean {
    return !!(
      food?.brandInfo?.nutritionSiteCandidates?.length || 
      food?.brandInfo?.productImageSiteCandidates?.length
    );
  }

  // Helper method to check if last response passed schema validation
  isLastResponseValid(food: any): boolean {
    return food && (food as any).__schemaValid !== false;
  }
}