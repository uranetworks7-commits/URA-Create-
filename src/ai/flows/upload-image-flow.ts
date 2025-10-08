'use server';

/**
 * @fileOverview A Genkit flow for uploading an image to an external service.
 *
 * - uploadImage - An async function that takes an image data URL and uploads it.
 * - UploadImageInput - The input type for the uploadImage function.
 * - UploadImageOutput - The output type for the uploadImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UploadImageInputSchema = z.object({
  imageDataUrl: z.string().describe(
    "A data URI of the image to upload. Must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the uploaded image.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

export async function uploadImage(input: UploadImageInput): Promise<UploadImageOutput> {
  return uploadImageFlow(input);
}

const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: UploadImageOutputSchema,
  },
  async ({ imageDataUrl }) => {
    // This flow previously used a package that was causing installation errors.
    // The functionality needs to be re-implemented with a stable image hosting solution.
    throw new Error('Image upload functionality is temporarily disabled due to a technical issue. Please use image URLs for now.');
  }
);
