import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  recipe: any;
  id: number;

  constructor(private recipeService: RecipeService,
    private route: ActivatedRoute, 
    private router: Router,
    private dataStorageService: DataStorageService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id =+ params['id'];
      this.recipeService.getRecipe(this.id).subscribe((recipe:any)=>{
        if(recipe){
          this.recipe = recipe   
        }
      });
    });
  }

  onAddToShoppingList() {
   this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
   this.dataStorageService.storeShoppingList();
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['/recipes']);
    this.dataStorageService.storeRecipes();
  }
}
