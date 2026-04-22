'use server';
/**
 * @fileOverview An AI agent that provides insights and summaries of sales data.
 *
 * - aiSalesInsights - A function that handles the generation of sales insights.
 * - AISalesInsightsInput - The input type for the aiSalesInsights function.
 * - AISalesInsightsOutput - The return type for the aiSalesInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISalesInsightsInputSchema = z.object({
  salesRecords: z.array(
    z.object({
      transactionId: z.string().describe('Unique identifier for the transaction.'),
      timestamp: z.string().describe('ISO string representing the transaction timestamp (e.g., "2023-10-27T10:30:00Z").'),
      items: z.array(
        z.object({
          itemId: z.string().describe('Unique identifier for the menu item.'),
          itemName: z.string().describe('Name of the menu item.'),
          quantity: z.number().int().positive().describe('Quantity of the item sold in this transaction.'),
          price: z.number().positive().describe('Unit price of the item at the time of sale.'),
        })
      ).describe('List of items sold in this transaction.'),
      totalAmount: z.number().positive().describe('Total amount of the transaction.'),
    })
  ).describe('An array of sales transaction records for analysis.'),
  dateRange: z.string().optional().describe('Optional: The date range of the provided sales data (e.g., "Last 7 days", "October 2023").'),
});
export type AISalesInsightsInput = z.infer<typeof AISalesInsightsInputSchema>;

const AISalesInsightsOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of sales insights, including top-selling items, peak hours, and potential trends.'),
});
export type AISalesInsightsOutput = z.infer<typeof AISalesInsightsOutputSchema>;

export async function aiSalesInsights(input: AISalesInsightsInput): Promise<AISalesInsightsOutput> {
  return aiSalesInsightsFlow(input);
}

const aiSalesInsightsPrompt = ai.definePrompt({
  name: 'aiSalesInsightsPrompt',
  input: {schema: AISalesInsightsInputSchema},
  output: {schema: AISalesInsightsOutputSchema},
  prompt: `You are an expert sales data analyst for a university cafeteria.\nYour task is to analyze the provided sales data and generate a concise summary of key insights.\nFocus on identifying:\n1.  **Top-selling items**: Which menu items generated the most revenue or were sold in the highest quantities?\n2.  **Peak hours/periods**: When are the busiest times for the cafeteria?\n3.  **Potential trends**: Are there any noticeable patterns in sales over time, by day of the week, or any other observable trends?\n\nAnalyze the following sales records:\n\n${'```json'}\n{{{json salesRecords}}}\n${'```'}\n\n${"{{#if dateRange}}The sales data covers the period: {{{dateRange}}}.{{/if}}"}\n\nPlease provide a summary of your findings in a structured and easy-to-understand format. Ensure the summary is actionable for menu planning and staffing decisions.`,
});

const aiSalesInsightsFlow = ai.defineFlow(
  {
    name: 'aiSalesInsightsFlow',
    inputSchema: AISalesInsightsInputSchema,
    outputSchema: AISalesInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await aiSalesInsightsPrompt(input);
    return output!;
  }
);
