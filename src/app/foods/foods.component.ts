import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FoodsApiService } from '../services/foods-api.service';
// REMOVED: import { Food, FoodNutrient } from '../models/food.model';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

interface SimplifiedNutrient {
  label: string;
  value: number;
  unit: string;
}

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.scss']
})
export class FoodsComponent implements OnInit {
  searchControl = new FormControl('');
  currentFood: any = null; // CHANGED: from foods array to single currentFood
  isLoading = false;
  displayedColumns: string[] = ['label', 'value', 'unit'];
  showingAllNutrients = false; // REMOVED: selectedFoodIndex since we only have one food

  panelExpanded(index: number) {
    // REMOVED: Not needed for single food display
  }

  constructor(private foodsService: FoodsApiService) {}

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        return query ? this.foodsService.searchFoods(query) : [];
      })
    ).subscribe({
      next: (results) => {
        // Store single food result
        this.currentFood = results;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // UPDATED - work with nutritionFacts structure from API
  private getNutrients(food: any): SimplifiedNutrient[] {
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
}