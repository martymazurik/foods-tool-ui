import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FoodsApiService } from '../services/foods-api.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

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
  currentFood: any = null;
  isLoading = false;
  displayedColumns: string[] = ['label', 'value', 'unit'];
  showingAllNutrients = false;

  constructor(private foodsService: FoodsApiService) {}

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
        this.currentFood = results;
        
        // Debug logging
        console.log('Full API response:', results);
        console.log('brandInfo exists:', !!results.brandInfo);
        console.log('nutritionSiteCandidates:', results.brandInfo?.nutritionSiteCandidates);
        console.log('productImageSiteCandidates:', results.brandInfo?.productImageSiteCandidates);
        console.log('hasBrandInfo result:', this.hasBrandInfo(results));
        
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // UPDATED - work with nutritionFacts structure from API
  public getNutrients(food: any): SimplifiedNutrient[] {
    // Check if nutritionFacts exists
    if (!food?.nutritionFacts) {
      return [];
    }

    const nf = food.nutritionFacts;
    const nutrients: SimplifiedNutrient[] = [];

    // Extract nutrients directly from nutritionFacts object
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

    // Sort in desired order
    const order = ['Calories', 'Protein', 'Carbs', 'Fat'];
    return nutrients.sort((a, b) => 
      order.indexOf(a.label) - order.indexOf(b.label)
    );
  }

  // SIMPLIFIED - no index needed for single food
  showAllNutrients() {
    this.showingAllNutrients = !this.showingAllNutrients;
  }

  // ADDED: Helper method for URI list component
  hasBrandInfo(food: any): boolean {
    return this.foodsService.hasBrandLinks(food);
  }

  // NEW: Image upload event handlers
  onImagesUploaded(response: ImageUploadResponse) {
    console.log('Images uploaded successfully:', response);
    // Refresh the food data after upload
    this.refreshCurrentFood();
  }

  onRefreshFood() {
    this.refreshCurrentFood();
  }

  private refreshCurrentFood() {
    const query = this.searchControl.value?.trim();
    if (query && this.currentFood) {
      this.foodsService.refreshFood(query).subscribe({
        next: (updatedFood) => {
          this.currentFood = updatedFood;
          console.log('Food data refreshed:', updatedFood);
        },
        error: (error) => {
          console.error('Failed to refresh food data:', error);
        }
      });
    }
  }

  // NEW: Getters for image upload component
  get currentFoodQuery(): string {
    return this.searchControl.value?.trim() || '';
  }

  // NEW: Getters for image upload component - always return null to keep upload areas empty
  get existingNutritionImageId(): string | null {
    return null; // Always show empty drag-and-drop area
  }

  get existingProductImageId(): string | null {
    return null; // Always show empty drag-and-drop area
  }

  get nutritionFactsStatus(): string | null {
    return this.currentFood?.nutritionFactsStatus || null;
  }

  // NEW: Image URL methods
  public nutritionImageUrl(): string | null {
    return this.currentFood?.nutritionFactsImage ? 
      this.foodsService.getImageUrl(this.currentFood.nutritionFactsImage) : null;
  }

  public productImageUrl(): string | null {
    return this.currentFood?.foodImage ? 
      this.foodsService.getImageUrl(this.currentFood.foodImage) : null;
  }

  // NEW: Helper methods to check if images exist
  hasNutritionImage(): boolean {
    return !!(this.currentFood?.nutritionFactsImage);
  }

  hasProductImage(): boolean {
    return !!(this.currentFood?.foodImage);
  }

  hasAnyImages(): boolean {
    return this.hasNutritionImage() || this.hasProductImage();
  }
}