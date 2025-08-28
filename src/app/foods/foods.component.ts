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
  foods: any[] = []; // CHANGED: Food[] to any[]
  isLoading = false;
  displayedColumns: string[] = ['label', 'value', 'unit'];
  selectedFoodIndex: number | null = 0;
  showingAllNutrients = false;

  panelExpanded(index: number) {
    this.selectedFoodIndex = index;
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
        // Take only first two results to avoid repetition
        this.foods = results.slice(0, 2);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // UNCHANGED - your existing getNutrients method
  private getNutrients(food: any): SimplifiedNutrient[] { // CHANGED: Food to any
    const findNutrient = (nutrients: any[], searchTerms: string[], preferredTerms: string[] = []): any | undefined => { // CHANGED: FoodNutrient[] to any[]
      // First try to find a match that includes any of the preferred terms
      if (preferredTerms.length > 0) {
        const preferredMatch = nutrients.find(n => 
          preferredTerms.every(term => 
            n.nutrientName.toLowerCase().includes(term.toLowerCase())
          )
        );
        if (preferredMatch) return preferredMatch;
      }

      // Fall back to basic term matching
      return nutrients.find(n => 
        searchTerms.some(term => 
          n.nutrientName.toLowerCase().includes(term.toLowerCase())
        )
      );
    };

    const nutrients: SimplifiedNutrient[] = [];

    // Find Carbohydrates
    const carbs = findNutrient(food.foodNutrients, ['carbohydrate']);
    if (carbs) {
      nutrients.push({
        label: 'Carbs',
        value: Math.round(carbs.value * 10) / 10,
        unit: 'g'
      });
    }

    // Find Protein
    const protein = findNutrient(food.foodNutrients, ['protein']);
    if (protein) {
      nutrients.push({
        label: 'Protein',
        value: Math.round(protein.value * 10) / 10,
        unit: 'g'
      });
    }

    // Find Energy (Calories) - more flexible matching
    const calories = findNutrient(
      food.foodNutrients, 
      ['energy', 'calorie'], 
      ['energy', 'atwater', 'specific']
    );
    if (calories) {
      nutrients.push({
        label: 'Calories',
        value: Math.round(calories.value),
        unit: 'KCal'
      });
    }

    // Find Fat - more flexible matching
    const fat = findNutrient(food.foodNutrients, ['lipid', 'fat']);
    if (fat) {
      nutrients.push({
        label: 'Fat',
        value: Math.round(fat.value * 10) / 10,
        unit: 'g'
      });
    }

    // Sort in desired order
    const order = ['Calories', 'Protein', 'Carbs', 'Fat'];
    return nutrients.sort((a, b) => 
      order.indexOf(a.label) - order.indexOf(b.label)
    );
  }

  // UNCHANGED - your existing showAllNutrients method
  showAllNutrients(food: any, index: number) { // CHANGED: Food to any
    if (this.selectedFoodIndex === index) {
      this.showingAllNutrients = !this.showingAllNutrients;
    } else {
      // If clicking different panel, select it and show nutrients
      this.selectedFoodIndex = index;
      this.showingAllNutrients = true;
    }
  }

  // ADDED: Helper method for URI list component
  hasBrandInfo(food: any): boolean {
    return !!(food?.brandInfo?.nutritionSiteCandidates?.length || food?.brandInfo?.productImageSiteCandidates?.length);
  }
}