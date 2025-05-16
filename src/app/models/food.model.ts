export interface FoodNutrient {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
}

export interface Food {
    fdcId: number;
    description: string;
    foodCategory: string;
    foodNutrients: FoodNutrient[];
}