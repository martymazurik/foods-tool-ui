import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FoodsApiService } from '../services/foods-api.service';
import { HttpErrorResponse } from '@angular/common/http';

interface SimplifiedNutrient {
  label: string;
  value: number;
  unit: string;
}

interface ImageUploadResponse {
  success: boolean;
  nutritionImageUploaded: boolean;
  productImageUploaded: boolean;
  nutritionFactsStatus: string;
  message: string;
}

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.scss']
})
export class FoodsComponent implements OnInit {
  searchControl = new FormControl('');
  foods: any[] = [];  // NEW: Array of all search results
  selectedFood: any = null;  // RENAMED from currentFood
  selectedIndex: number = 0;  // NEW: Track selected item
  isLoading = false;
  displayedColumns: string[] = ['label', 'value', 'unit'];
  showingAllNutrients = false;

  constructor(
    private foodsService: FoodsApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Remove automatic API calls on typing
  }

  performSearch() {
    const query = this.searchControl.value?.trim();
    if (!query || query.length < 2) {
      return;
    }

    this.isLoading = true;
    this.foodsService.searchFoods(query).subscribe({
      next: (results) => {
        console.log('RAW API RESPONSE:', results);
        
        // API returns {count: number, foods: array} - extract the foods array
        if (results && results.foods && Array.isArray(results.foods)) {
          this.foods = results.foods;
        } else if (Array.isArray(results)) {
          this.foods = results;
        } else {
          this.foods = [results];
        }
        
        console.log('foods array:', this.foods);
        console.log('foods.length:', this.foods.length);
        
        // Auto-select first item
        if (this.foods.length > 0) {
          this.selectedIndex = 0;
          this.selectedFood = this.foods[0];
          console.log('Selected first food:', this.selectedFood?.description);
        } else {
          this.selectedFood = null;
          this.selectedIndex = -1;
          console.log('No foods to select');
        }
        
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.foods = [];
        this.selectedFood = null;
        this.handleError(error, 'Failed to search foods');
      }
    });
  }

  // NEW: Handle food selection from list
  onFoodSelected(index: number) {
    if (index >= 0 && index < this.foods.length) {
      this.selectedIndex = index;
      this.selectedFood = this.foods[index];
      console.log('Selected:', this.selectedFood.description);
    }
  }

  // NEW: Truncate description for list display
  truncateDescription(description: string, maxLength: number = 40): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3) + '...';
  }

  // Error handler with toast notifications
  private handleError(error: HttpErrorResponse, context: string) {
    let message = '';
    
    if (error.status === 0) {
      message = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 404) {
      message = 'Food not found. Try a different search term.';
    } else if (error.status === 500) {
      message = 'Server error occurred. Please try again later.';
    } else if (error.status >= 400 && error.status < 500) {
      message = error.error?.message || `Request failed: ${error.statusText}`;
    } else if (error.status >= 500) {
      message = 'Server error. Our team has been notified.';
    } else {
      message = `${context}: ${error.message}`;
    }

    this.showErrorToast(message);
    console.error('API Error:', error);
  }

  // Show error toast with close button
  private showErrorToast(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Work with nutritionFacts structure from API
  public getNutrients(food: any): SimplifiedNutrient[] {
    if (!food?.nutritionFacts) {
      return [];
    }

    const nf = food.nutritionFacts;
    const nutrients: SimplifiedNutrient[] = [];

    if (typeof nf.calories === 'number') {
      nutrients.push({
        label: 'Calories',
        value: Math.round(nf.calories),
        unit: 'kcal'
      });
    }

    if (typeof nf.proteinG === 'number') {
      nutrients.push({
        label: 'Protein',
        value: Math.round(nf.proteinG * 10) / 10,
        unit: 'g'
      });
    }

    if (typeof nf.totalCarbohydrateG === 'number') {
      nutrients.push({
        label: 'Carbs',
        value: Math.round(nf.totalCarbohydrateG * 10) / 10,
        unit: 'g'
      });
    }

    if (typeof nf.totalFatG === 'number') {
      nutrients.push({
        label: 'Fat',
        value: Math.round(nf.totalFatG * 10) / 10,
        unit: 'g'
      });
    }

    const order = ['Calories', 'Protein', 'Carbs', 'Fat'];
    return nutrients.sort((a, b) => 
      order.indexOf(a.label) - order.indexOf(b.label)
    );
  }

  showAllNutrients() {
    this.showingAllNutrients = !this.showingAllNutrients;
  }

  // Helper method for URI list component
  hasBrandInfo(food: any): boolean {
    return this.foodsService.hasBrandLinks(food);
  }

  // Image upload event handlers
  onImagesUploaded(response: ImageUploadResponse) {
    console.log('Images uploaded successfully:', response);
    this.refreshCurrentFood();
  }

  onRefreshFood() {
    this.refreshCurrentFood();
  }

  private refreshCurrentFood() {
    const query = this.searchControl.value?.trim();
    if (query && this.selectedFood) {
      this.foodsService.refreshFood(query).subscribe({
        next: (updatedFood) => {
          this.selectedFood = updatedFood;
          console.log('Food data refreshed:', updatedFood);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Failed to refresh food data');
        }
      });
    }
  }

  // Getters for image upload component
  get currentFoodQuery(): string {
    return this.searchControl.value?.trim() || '';
  }

  get existingNutritionImageId(): string | null {
    return null;
  }

  get existingProductImageId(): string | null {
    return null;
  }

  get nutritionFactsStatus(): string | null {
    return this.selectedFood?.nutritionFactsStatus || null;
  }

  // Image URL methods
  public nutritionImageUrl(): string | null {
    return this.selectedFood?.nutritionFactsImage ? 
      this.foodsService.getImageUrl(this.selectedFood.nutritionFactsImage) : null;
  }

  public productImageUrl(): string | null {
    return this.selectedFood?.foodImage ? 
      this.foodsService.getImageUrl(this.selectedFood.foodImage) : null;
  }

  // Helper methods to check if images exist
  hasNutritionImage(): boolean {
    return !!(this.selectedFood?.nutritionFactsImage);
  }

  hasProductImage(): boolean {
    return !!(this.selectedFood?.foodImage);
  }

  hasAnyImages(): boolean {
    return this.hasNutritionImage() || this.hasProductImage();
  }
}