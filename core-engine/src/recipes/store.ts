import * as fs from 'fs/promises';
import * as path from 'path';
import { Recipe } from './types';

// Temporary ActionRequest type
interface ActionRequest {
  type: string;
  params: any;
  requestId: string;
}
// import { ActionRequest } from '@shared/types';

const DATA_DIR = path.join(__dirname, '../../data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');

/**
 * Ensure data directory exists
 */
const ensureDataDir = async (): Promise<void> => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
};

/**
 * Load all recipes from file
 */
const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(RECIPES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err: any) {
    // File doesn't exist yet - return empty array
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
};

/**
 * Save all recipes to file
 */
const saveRecipes = async (recipes: Recipe[]): Promise<void> => {
  await ensureDataDir();
  await fs.writeFile(RECIPES_FILE, JSON.stringify(recipes, null, 2), 'utf-8');
};

/**
 * List all recipes
 */
export const listRecipes = async (): Promise<Recipe[]> => {
  return await loadRecipes();
};

/**
 * Get a specific recipe by ID or name
 */
export const getRecipe = async (identifier: string): Promise<Recipe | null> => {
  const recipes = await loadRecipes();
  
  // Try to find by ID first, then by name (case-insensitive)
  return recipes.find(r => 
    r.id === identifier || 
    r.name.toLowerCase() === identifier.toLowerCase()
  ) || null;
};

/**
 * Save a new recipe or update existing one
 */
export const saveRecipe = async (recipe: Recipe): Promise<Recipe> => {
  const recipes = await loadRecipes();
  
  // Check if recipe with same ID exists
  const existingIndex = recipes.findIndex(r => r.id === recipe.id);
  
  if (existingIndex >= 0) {
    // Update existing
    recipes[existingIndex] = recipe;
    console.log(`[store] Updated recipe: ${recipe.name} (${recipe.id})`);
  } else {
    // Add new
    recipes.push(recipe);
    console.log(`[store] Created recipe: ${recipe.name} (${recipe.id})`);
  }
  
  await saveRecipes(recipes);
  return recipe;
};

/**
 * Delete a recipe by ID
 */
export const deleteRecipe = async (id: string): Promise<boolean> => {
  const recipes = await loadRecipes();
  const filteredRecipes = recipes.filter(r => r.id !== id);
  
  if (filteredRecipes.length === recipes.length) {
    return false; // Recipe not found
  }
  
  await saveRecipes(filteredRecipes);
  console.log(`[store] Deleted recipe: ${id}`);
  return true;
};

/**
 * Check if recipe with name already exists
 */
export const recipeExists = async (name: string): Promise<boolean> => {
  const recipes = await loadRecipes();
  return recipes.some(r => r.name.toLowerCase() === name.toLowerCase());
};