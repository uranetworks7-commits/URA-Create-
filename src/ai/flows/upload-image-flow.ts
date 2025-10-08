'use server';

/**
 * @fileOverview A Genkit flow for uploading an image or video to an external service.
 *
 * - uploadImage - An async function that takes image/video data and uploads it.
 * - UploadImageInput - The input type for the uploadImage function.
 * - UploadImageOutput - The output type for the uploadImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UploadImageInputSchema = z.object({
  imageDataUrl: z.string().describe(
    "A data URI of the image or video to upload. Must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  contentType: z.string().describe("The MIME type of the file being uploaded."),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the uploaded media.'),
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
  async ({ imageDataUrl, contentType }) => {
    try {
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: (() => {
          const b64 = imageDataUrl.substring(imageDataUrl.indexOf(',') + 1);
          const byteCharacters = atob(b64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {type: contentType});

          const formData = new FormData();
          formData.append('reqtype', 'fileupload');
          formData.append('fileToUpload', blob);
          return formData;
        })()
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.statusText}`);
      }

      const textResponse = await response.text();

      // Catbox.moe returns a URL directly as text/plain
      if (textResponse.startsWith('http')) {
        return { imageUrl: textResponse };
      } else {
        throw new Error(`Failed to parse upload response: ${textResponse}`);
      }
    } catch (error) {
      console.error('Catbox upload error:', error);
      throw new Error('Image upload failed due to a network or API error.');
    }
  }
);
