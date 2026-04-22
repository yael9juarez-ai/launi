'use server';
/**
 * @fileOverview An AI agent for inventory forecasting and reorder suggestions.
 *
 * - aiInventoryForecasting - A function that handles the inventory forecasting process.
 * - InventoryForecastInput - The input type for the aiInventoryForecasting function.
 * - InventoryForecastOutput - The return type for the aiInventoryForecasting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const InventoryForecastInputSchema = z.object({
  salesHistory: z.array(
    z.object({
      itemId: z.string().describe('The ID of the menu item sold.'),
      itemName: z.string().describe('The name of the menu item sold.'),
      quantitySold: z.number().int().positive().describe('The quantity of the item sold.'),
      date: z.string().datetime().describe('The date and time of the sale (ISO 8601 format).'),
    })
  ).describe('Historical sales data including item IDs, names, quantities, and dates.'),
  upcomingEvents: z.array(
    z.object({
      eventName: z.string().describe('The name of the upcoming university event.'),
      date: z.string().datetime().describe('The date of the event (ISO 8601 format).'),
      type: z.string().describe('The type of event (e.g., "lecture", "festival", "exam week").'),
      expectedAttendance: z.number().int().positive().optional().describe('Expected attendance for the event.'),
      impactOnCafeteria: z.string().optional().describe('How the event is expected to impact cafeteria demand (e.g., "high", "moderate", "low").'),
    })
  ).describe('Information about upcoming university events that might influence demand.'),
  menuChanges: z.array(
    z.object({
      changeType: z.enum(['new', 'removed', 'updated']).describe('Type of menu change: new, removed, or updated item.'),
      itemId: z.string().optional().describe('The ID of the menu item affected.'),
      itemName: z.string().describe('The name of the menu item affected.'),
      details: z.string().describe('Details about the change, e.g., recipe modification, popularity trend.'),
      estimatedImpact: z.string().optional().describe('Estimated impact on demand for this item (e.g., "significant increase", "slightly decrease").'),
    })
  ).describe('Recent or planned menu changes that affect ingredient usage.'),
  currentInventory: z.array(
    z.object({
      ingredientId: z.string().describe('The ID of the ingredient.'),
      ingredientName: z.string().describe('The name of the ingredient.'),
      currentStock: z.number().positive().or(z.literal(0)).describe('The current quantity in stock.'),
      unit: z.string().describe('The unit of measurement for the ingredient (e.g., "kg", "liters", "units").'),
      minStockLevel: z.number().positive().optional().describe('Minimum desired stock level for the ingredient.'),
      supplierLeadTimeDays: z.number().int().positive().optional().describe('Number of days it takes for a supplier to deliver.'),
    })
  ).describe('Current inventory levels for all ingredients.'),
  ingredientRecipes: z.array(
    z.object({
      itemId: z.string().describe('The ID of the menu item.'),
      itemName: z.string().describe('The name of the menu item.'),
      ingredients: z.array(
        z.object({
          ingredientId: z.string().describe('The ID of the required ingredient.'),
          ingredientName: z.string().describe('The name of the required ingredient.'),
          quantity: z.number().positive().describe('The quantity of the ingredient needed for one unit of the menu item.'),
          unit: z.string().describe('The unit of measurement for the ingredient in the recipe.'),
        })
      ).describe('List of ingredients and their quantities for this menu item.'),
    })
  ).describe('Recipes mapping menu items to their required ingredients.'),
  forecastingPeriodDays: z.number().int().positive().describe('The number of days into the future to forecast inventory for.'),
});
export type InventoryForecastInput = z.infer<typeof InventoryForecastInputSchema>;

// Output Schema
const InventoryForecastOutputSchema = z.object({
  reorderSuggestions: z.array(
    z.object({
      ingredientId: z.string().describe('The ID of the ingredient to reorder.'),
      ingredientName: z.string().describe('The name of the ingredient to reorder.'),
      suggestedReorderQuantity: z.number().int().positive().describe('The suggested quantity to reorder for this ingredient.'),
      unit: z.string().describe('The unit of measurement for the suggested reorder quantity.'),
      reasoning: z.string().describe('Detailed explanation for the reorder suggestion, considering sales, events, and menu.'),
      currentStock: z.number().describe('Current stock of the ingredient for reference.'),
      predictedDemand: z.number().optional().describe('Predicted demand for this ingredient over the forecasting period.'),
    })
  ).describe('List of suggested ingredient reorders with quantities and reasoning.'),
  predictedDemandSummary: z.string().describe('A summary of the overall predicted demand trends and factors considered.'),
  recommendationsForOptimization: z.array(z.string()).optional().describe('Additional recommendations for inventory optimization (e.g., adjust min stock, promote items).'),
});
export type InventoryForecastOutput = z.infer<typeof InventoryForecastOutputSchema>;

// Wrapper function
export async function aiInventoryForecasting(input: InventoryForecastInput): Promise<InventoryForecastOutput> {
  return aiInventoryForecastingFlow(input);
}

// Genkit Prompt Definition
const aiInventoryForecastPrompt = ai.definePrompt({
  name: 'aiInventoryForecastPrompt',
  input: { schema: InventoryForecastInputSchema },
  output: { schema: InventoryForecastOutputSchema },
  prompt: `You are an AI inventory management assistant for a university cafeteria. Your goal is to predict future ingredient demand based on provided data and generate smart reorder suggestions to optimize inventory, minimize waste, and prevent stockouts.\n\nConsider the following information to make your predictions and suggestions for the next {{forecastingPeriodDays}} days:\n\n## Sales History:\n{{#if salesHistory}}\nHere is the historical sales data:\n{{#each salesHistory}}\n- Item ID: {{{itemId}}}, Name: {{{itemName}}}, Quantity Sold: {{{quantitySold}}}, Date: {{{date}}}\n{{/each}}\n{{else}}\nNo sales history provided.\n{{/if}}\n\n## Upcoming University Events:\n{{#if upcomingEvents}}\nHere are upcoming university events that may impact cafeteria demand:\n{{#each upcomingEvents}}\n- Event Name: {{{eventName}}}, Date: {{{date}}}, Type: {{{type}}}, Expected Attendance: {{{expectedAttendance}}}{{#if impactOnCafeteria}}, Estimated Impact: {{{impactOnCafeteria}}}{{/if}}\n{{/each}}\n{{else}}\nNo upcoming events provided.\n{{/if}}\n\n## Menu Changes:\n{{#if menuChanges}}\nHere are recent or planned menu changes:\n{{#each menuChanges}}\n- Change Type: {{{changeType}}}, Item Name: {{{itemName}}}{{#if itemId}} (ID: {{{itemId}}}){{/if}}, Details: {{{details}}}{{#if estimatedImpact}}, Estimated Impact on Demand: {{{estimatedImpact}}}{{/if}}\n{{/each}}\n{{else}}\nNo menu changes provided.\n{{/if}}\n\n## Current Inventory:\n{{#if currentInventory}}\nHere are the current stock levels for each ingredient:\n{{#each currentInventory}}\n- Ingredient ID: {{{ingredientId}}}, Name: {{{ingredientName}}}, Current Stock: {{{currentStock}}} {{{unit}}}{{#if minStockLevel}}, Minimum Stock Level: {{{minStockLevel}}} {{{unit}}}{{/if}}{{#if supplierLeadTimeDays}}, Supplier Lead Time: {{{supplierLeadTimeDays}}} days{{/if}}\n{{/each}}\n{{else}}\nNo current inventory data provided.\n{{/if}}\n\n## Ingredient Recipes:\n{{#if ingredientRecipes}}\nHere are the recipes mapping menu items to their required ingredients:\n{{#each ingredientRecipes}}\n- Menu Item: {{{itemName}}} (ID: {{{itemId}}}) requires:\n  {{#each ingredients}}\n  - Ingredient: {{{ingredientName}}} (ID: {{{ingredientId}}}), Quantity: {{{quantity}}} {{{unit}}}\n  {{/each}}\n{{/each}}\n{{else}}\nNo ingredient recipe data provided.\n{{/if}}\n\nBased on the above information, provide:\n1.  **Reorder Suggestions**: For each ingredient that needs reordering to meet demand for the next {{forecastingPeriodDays}} days, suggest a quantity to reorder. Take into account current stock, predicted demand based on sales history adjusted by events and menu changes, minimum stock levels, and supplier lead times if available. Provide detailed reasoning for each suggestion.\n2.  **Predicted Demand Summary**: A summary of the overall predicted demand trends and factors influencing these predictions.\n3.  **Recommendations for Optimization**: Optionally, suggest other ways to optimize inventory (e.g., adjust min stock levels for certain ingredients, promote under-utilized items).\n\nEnsure your output adheres to the specified JSON schema for `InventoryForecastOutputSchema`.\n`,
});

// Genkit Flow Definition
const aiInventoryForecastingFlow = ai.defineFlow(
  {
    name: 'aiInventoryForecastingFlow',
    inputSchema: InventoryForecastInputSchema,
    outputSchema: InventoryForecastOutputSchema,
  },
  async (input) => {
    const {output} = await aiInventoryForecastPrompt(input);
    if (!output) {
      throw new Error('AI prompt did not return any output.');
    }
    return output;
  }
);
