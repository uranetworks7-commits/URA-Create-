'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting animations and effects for web design elements.
 *
 * It provides the `suggestAnimationsAndEffects` function which takes the current page design as input and returns a list of suggested animations and effects.
 *
 * - suggestAnimationsAndEffects - An async function that suggests animations and effects for a given web page design.
 * - SuggestAnimationsAndEffectsInput - The input type for the suggestAnimationsAndEffects function.
 * - SuggestAnimationsAndEffectsOutput - The output type for the suggestAnimationsAndEffects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAnimationsAndEffectsInputSchema = z.object({
  pageDescription: z
    .string()
    .describe("A detailed description of the current web page, including its layout, elements, and overall purpose."),
  elementDescription: z
    .string()
    .describe("A detailed description of the specific element to which animations and effects are being considered, including its type, purpose, and current styling."),
});
export type SuggestAnimationsAndEffectsInput = z.infer<typeof SuggestAnimationsAndEffectsInputSchema>;

const SuggestAnimationsAndEffectsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      animationName: z.string().describe("The name of the suggested animation or effect."),
      animationDescription: z.string().describe("A detailed description of the suggested animation or effect, including when and how it should be used."),
      relevanceScore: z.number().describe("A numerical score (0-1) indicating the relevance of the animation or effect to the given element and page description."),
    })
  ).describe("A list of suggested animations and effects, ranked by relevance score."),
});
export type SuggestAnimationsAndEffectsOutput = z.infer<typeof SuggestAnimationsAndEffectsOutputSchema>;

export async function suggestAnimationsAndEffects(
  input: SuggestAnimationsAndEffectsInput
): Promise<SuggestAnimationsAndEffectsOutput> {
  return suggestAnimationsAndEffectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAnimationsAndEffectsPrompt',
  input: {schema: SuggestAnimationsAndEffectsInputSchema},
  output: {schema: SuggestAnimationsAndEffectsOutputSchema},
  prompt: `You are an AI assistant that suggests animations and effects for web design elements.

You are given a description of the current web page and a description of a specific element on that page.

Based on these descriptions, you should suggest a list of relevant, page-appropriate, and professional-looking animations and effects for the element.

The suggestions should be ranked by relevance score (0-1), with the most relevant suggestions listed first. Provide the animation description to help the user choose from the list.

Page Description: {{{pageDescription}}}
Element Description: {{{elementDescription}}}

Ensure that the suggestions are suitable for a professional web design context and enhance the user experience.

Output the suggestions in JSON format.
`,
});

const suggestAnimationsAndEffectsFlow = ai.defineFlow(
  {
    name: 'suggestAnimationsAndEffectsFlow',
    inputSchema: SuggestAnimationsAndEffectsInputSchema,
    outputSchema: SuggestAnimationsAndEffectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
