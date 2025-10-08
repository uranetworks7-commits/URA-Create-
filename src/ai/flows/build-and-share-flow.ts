'use server';

/**
 * @fileOverview A Genkit flow for building a project into a zip and optionally sharing it.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateHtmlForProject } from '@/lib/html-builder';
import type { Project } from '@/lib/types';
import JSZip from 'jszip';
import { uploadImage } from './upload-image-flow';

const BuildRequestSchema = z.object({
  project: z.any().describe("The project object."),
  forShare: z.boolean().optional().describe("Whether the build is for sharing."),
  zip: z.boolean().optional().describe("Whether to zip the output."),
});

const BuildResponseSchema = z.object({
  htmlContent: z.string().optional(),
  zipContent: z.string().optional().describe("Base64 encoded zip file content."),
  shareUrl: z.string().optional(),
});

export async function buildAndShareProject(input: z.infer<typeof BuildRequestSchema>): Promise<z.infer<typeof BuildResponseSchema>> {
  return buildAndShareFlow(input);
}

const buildAndShareFlow = ai.defineFlow(
  {
    name: 'buildAndShareFlow',
    inputSchema: BuildRequestSchema,
    outputSchema: BuildResponseSchema,
  },
  async ({ project, forShare, zip }) => {
    const htmlContent = generateHtmlForProject(project as Project);

    if (!zip) {
      return { htmlContent };
    }

    const zipFile = new JSZip();
    zipFile.file(`${(project as Project).name.toLowerCase().replace(/\s/g, '-') || 'index'}.html`, htmlContent);
    const zipContent = await zipFile.generateAsync({ type: 'base64' });

    if (forShare) {
      const dataUrl = `data:application/zip;base64,${zipContent}`;
      try {
        const result = await uploadImage({ imageDataUrl: dataUrl, contentType: 'application/zip' });
        if (result.imageUrl) {
          return { shareUrl: result.imageUrl };
        } else {
          throw new Error("Sharing failed: did not receive a URL.");
        }
      } catch (e) {
        console.error(e);
        throw new Error("Failed to upload the project zip file.");
      }
    }

    return { zipContent };
  }
);
