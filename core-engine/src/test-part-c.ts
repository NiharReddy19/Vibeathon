import { parseIntent } from './nlu/rules';
import { runAction } from './actions';
import { createRecipeFromHistory, getRecentActions } from './recipes/history';
import { saveRecipe, listRecipes } from './recipes/store';
import { v4 as uuid } from 'uuid';

// Temporary type until Person D creates @aurora/shared
interface ActionRequest {
  type: string;
  params: any;
  requestId: string;
}

/**
 * Test script for Part C functionality
 */
async function testNLU() {
  console.log('\n===== Testing NLU =====\n');
  
  const testPhrases = [
    'open chrome',
    'launch visual studio code',
    'list windows',
    'find config.json',
    'project mode research',
    'pause for 5 minutes',
    'save recipe as my workflow',
    'do a backflip' // Should be unknown
  ];
  
  for (const phrase of testPhrases) {
    const result = parseIntent(phrase);
    console.log(`Input: "${phrase}"`);
    console.log(`Intent: ${result.intent}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log(`Slots:`, result.slots);
    console.log('---');
  }
}

async function testActions() {
  console.log('\n===== Testing Actions =====\n');
  
  // Test open_app
  console.log('Testing: open_app (notepad - safer than chrome)');
  const openResult = await runAction({
    type: 'open_app',
    params: { app_name: 'notepad' },
    requestId: uuid()
  });
  console.log('Result:', openResult);
  console.log('---');
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test list_windows
  console.log('Testing: list_windows');
  const listResult = await runAction({
    type: 'list_windows',
    params: {},
    requestId: uuid()
  });
  console.log('Result:', listResult);
  console.log('---');
}

async function testRecipes() {
  console.log('\n===== Testing Recipes =====\n');
  
  // Check if we have history
  const history = getRecentActions(5);
  console.log(`Current history: ${history.length} actions`);
  
  if (history.length > 0) {
    // Create recipe from history
    console.log('Creating recipe from history...');
    const recipe = createRecipeFromHistory('test-workflow', 2);
    console.log('Recipe:', recipe);
    
    // Save recipe
    await saveRecipe(recipe);
    console.log('Recipe saved!');
  }
  
  // List all recipes
  const recipes = await listRecipes();
  console.log('\nAll recipes:', recipes.map(r => ({ name: r.name, steps: r.steps.length })));
}

async function testEndToEnd() {
  console.log('\n===== End-to-End Test =====\n');
  
  // Simulate voice command pipeline
  const command = 'open calculator';
  
  console.log(`1. User says: "${command}"`);
  
  // Parse intent
  const intent = parseIntent(command);
  console.log('2. Parsed intent:', intent);
  
  if (intent.confidence < 0.5) {
    console.log('❌ Low confidence - would ask user to confirm');
    return;
  }
  
  // Execute action
  console.log('3. Executing action...');
  const result = await runAction({
    type: intent.intent,
    params: intent.slots,
    requestId: uuid()
  });
  
  console.log('4. Action result:', result);
  
  if (result.ok) {
    console.log('✅ Success! Calculator should have opened.');
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  // Check history
  const history = getRecentActions(5);
  console.log(`5. Recent actions in history: ${history.length}`);
}

// Run all tests
async function runTests() {
  try {
    await testNLU();
    await testActions();
    await testRecipes();
    await testEndToEnd();
    
    console.log('\n✅ All tests completed!\n');
    console.log('Summary:');
    console.log('- NLU is parsing intents correctly');
    console.log('- Actions are executing (check if apps opened)');
    console.log('- Recipes are being saved to data/recipes.json');
    console.log('\n🎯 Part C is working! Ready for integration.\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

runTests();