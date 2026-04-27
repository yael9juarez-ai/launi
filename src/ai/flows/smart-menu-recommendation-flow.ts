
'use server';
/**
 * @fileOverview A Genkit flow for generating smart menu recommendations based on user preferences, popular items, and promotions.
 *
 * - smartMenuRecommendation - A function that handles the menu recommendation process.
 * - SmartMenuRecommendationInput - The input type for the smartMenuRecommendation function.
 * - SmartMenuRecommendationOutput - The return type for the smartMenuRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartMenuRecommendationInputSchema = z.object({
  customerOrderHistory: z
    .array(z.string())
    .describe('A list of menu items the customer has ordered in the past, e.g., ["Pizza Slice", "Coffee"]').optional(),
  popularMenuItems: z
    .array(z.string())
    .describe('A list of currently popular menu items, e.g., ["Burger", "Salad"]').optional(),
  currentPromotions: z
    .array(z.string())
    .describe('A list of current promotions or special offers, e.g., ["20% off all sandwiches", "Free drink with any meal"]').optional(),
  availableMenuItems: z
    .array(
      z.object({
        name: z.string().describe('The name of the menu item.'),
        description: z.string().describe('A brief description of the menu item.'),
        price: z.number().describe('The price of the menu item.'),
        category: z.string().describe('The category of the menu item (e.g., "Comida", "Bebidas", "Dulces").'),
      })
    )
    .describe('A comprehensive list of all currently available menu items with their details.'),
});
export type SmartMenuRecommendationInput = z.infer<typeof SmartMenuRecommendationInputSchema>;

const SmartMenuRecommendationOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        item: z.string().describe('The name of the recommended menu item.'),
        reason: z.string().describe('A short, compelling reason for this recommendation.'),
      })
    )
    .describe('A list of recommended menu items with a brief explanation for each recommendation.'),
});
export type SmartMenuRecommendationOutput = z.infer<typeof SmartMenuRecommendationOutputSchema>;

export async function smartMenuRecommendation(
  input: SmartMenuRecommendationInput
): Promise<SmartMenuRecommendationOutput> {
  return smartMenuRecommendationFlow(input);
}

const smartMenuRecommendationPrompt = ai.definePrompt({
  name: 'smartMenuRecommendationPrompt',
  input: { schema: SmartMenuRecommendationInputSchema },
  output: { schema: SmartMenuRecommendationOutputSchema },
  prompt: `You are an expert menu recommender for a university cafeteria, UniEats. Your goal is to suggest delicious and appealing menu items to customers based on their preferences, popular choices, and ongoing promotions.

Special Focus: Suggest complementaries. If a user orders "Comida", prioritize suggesting something from "Bebidas" or "Dulces" (like our popular gummy packs).

Here is the information to consider for making your recommendations:

Customer's Past Orders (if available):
{{#if customerOrderHistory}}
  {{#each customerOrderHistory}}
  - {{{this}}}
  {{/each}}
{{else}}
  No past order history available.
{{/if}}

Currently Popular Menu Items (if available):
{{#if popularMenuItems}}
  {{#each popularMenuItems}}
  - {{{this}}}
  {{/each}}
{{else}}
  No specific popular items data available at the moment.
{{/if}}

Current Promotions (if available):
{{#if currentPromotions}}
  {{#each currentPromotions}}
  - {{{this}}}
  {{/each}}
{{else}}
  No current promotions available.
{{/if}}

All Available Menu Items:
{{#each availableMenuItems}}
- Name: {{{name}}}, Description: {{{description}}}, Price: $ {{price}}, Category: {{{category}}}
{{/each}}

Based on the above information, provide a list of 3-5 menu item recommendations. For each recommendation, provide a short, compelling reason. Prioritize recommendations that align with past orders, popular items, or current promotions. Ensure all recommended items are from the 'All Available Menu Items' list.
`,
});

const smartMenuRecommendationFlow = ai.defineFlow(
  {
    name: 'smartMenuRecommendationFlow',
    inputSchema: SmartMenuRecommendationInputSchema,
    outputSchema: SmartMenuRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await smartMenuRecommendationPrompt(input);
    return output!;
  }
);
