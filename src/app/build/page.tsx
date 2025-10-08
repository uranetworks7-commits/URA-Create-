'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { generateHtmlForProject } from '@/lib/html-builder';


export default function BuildPage() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateCode = () => {
    const storedProject = localStorage.getItem('ura-preview-project');
    if (!storedProject) {
      toast({
        variant: 'destructive',
        title: 'No Project Found',
        description: 'Please go back to the editor and make sure your project is there.',
      });
      return;
    }
    
    if (JSON.parse(storedProject).pages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Project',
        description: 'Your project must have at least one page to generate code.',
      });
      return;
    }

    setIsBuilding(true);
    setGeneratedCode(null);

    // Simulate build time
    setTimeout(() => {
      try {
        const project: Project = JSON.parse(storedProject);
        const html = generateHtmlForProject(project);
        setGeneratedCode(html);
        toast({
          title: 'Code Generated!',
          description: 'Your project code is ready.',
        });
      } catch (e) {
        console.error(e);
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: 'Could not generate code for the project.',
        });
      } finally {
        setIsBuilding(false);
      }
    }, 1500);
  };

  const handleDownloadSrc = () => {
    if (!generatedCode) {
      toast({
        variant: 'destructive',
        title: 'No Code to Download',
        description: 'Please generate the code first.',
      });
      return;
    }
    const storedProject = localStorage.getItem('ura-preview-project');
    const project: Project = storedProject ? JSON.parse(storedProject) : { name: 'ura-project' };
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s/g, '-') || 'ura-project'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-4xl anim-pop">
        <CardHeader>
          <CardTitle>Project Builder</CardTitle>
          <CardDescription>Generate a single HTML file for your entire project or download the source code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleGenerateCode} disabled={isBuilding} className="w-full">
              {isBuilding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
              Generate Code
            </Button>
            <Button onClick={handleDownloadSrc} disabled={!generatedCode} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download SRC
            </Button>
          </div>
          {isBuilding && (
            <div className="flex flex-col items-center justify-center space-y-2 rounded-md border p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Building your project... Please wait.</p>
            </div>
          )}
          {generatedCode && (
            <div>
              <h3 className="font-semibold mb-2">Generated HTML</h3>
              <ScrollArea className="h-72 rounded-md border">
                <Textarea readOnly value={generatedCode} className="h-full w-full font-mono text-xs" />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
