
'use server';
/**
 * @fileOverview An AI agent for inventory forecasting and reorder suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InventoryForecastInputSchema = z.object({
  salesHistory: z.array(z.any()),
  upcomingEvents: z.array(z.any()),
  menuChanges: z.array(z.any()),
  currentInventory: z.array(z.any()),
  ingredientRecipes: z.array(z.any()),
  forecastingPeriodDays: z.number().int().positive(),
});
export type InventoryForecastInput = z.infer<typeof InventoryForecastInputSchema>;

const InventoryForecastOutputSchema = z.object({
  reorderSuggestions: z.array(z.any()),
  predictedDemandSummary: z.string(),
  recommendationsForOptimization: z.array(z.string()).optional(),
});
export type InventoryForecastOutput = z.infer<typeof InventoryForecastOutputSchema>;

export async function aiInventoryForecasting(input: InventoryForecastInput): Promise<InventoryForecastOutput> {
  return aiInventoryForecastingFlow(input);
}

const aiInventoryForecastPrompt = ai.definePrompt({
  name: 'aiInventoryForecastPrompt',
  input: { schema: InventoryForecastInputSchema },
  output: { schema: InventoryForecastOutputSchema },
  prompt: `You are an AI inventory management assistant for a university cafeteria.
  Based on the provided information, provide reorder suggestions and a demand summary.
  Ensure your output adheres to the specified JSON schema.`,
});

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
