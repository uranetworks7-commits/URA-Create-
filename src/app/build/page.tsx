'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project, Page, EditorElement, ButtonElement } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const generateHtmlForProject = (project: Project): string => {
  const getElementStyle = (element: EditorElement): string => {
    return `position: absolute; left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; height: ${element.size.height}px; transform: rotate(${element.rotation || 0}deg); overflow: hidden;`;
  };

  const getClipPathForShape = (shape: ButtonElement['shape']): string | undefined => {
    switch (shape) {
      case 'triangle-up': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'triangle-down': return 'polygon(0% 0%, 100% 0%, 50% 100%)';
      default: return undefined;
    }
  }

  const generateElementHtml = (element: EditorElement): string => {
    let content = '';
    let style = getElementStyle(element);

    switch (element.type) {
      case 'text':
        style += `font-size: ${element.fontSize}px; color: ${element.color}; font-weight: ${element.fontWeight}; display: flex; align-items: center; justify-content: center;`;
        content = `<p style="${style}">${element.content}</p>`;
        break;
      case 'button':
        const clipPath = getClipPathForShape(element.shape);
        let borderRadius;
        if (element.shape === 'circle') borderRadius = '50%';
        else if (element.shape === 'pill') borderRadius = '9999px';
        else borderRadius = `${element.borderRadius}px`;
        
        const buttonInnerStyle = `font-size: ${element.fontSize}px; color: ${element.color}; background-color: ${element.backgroundColor}; font-weight: ${element.fontWeight}; border-radius: ${borderRadius}; width: 100%; height: 100%; border: none; cursor: pointer;`;
        const buttonWrapperStyle = clipPath ? `clip-path: ${clipPath};` : '';
        content = `
          <div style="${style}">
            <div style="${buttonWrapperStyle} width: 100%; height: 100%;">
              <button style="${buttonInnerStyle}" ${element.linkToPageId ? `data-link-to="${element.linkToPageId}"` : ''}>${element.content}</button>
            </div>
          </div>
        `;
        break;
      case 'image':
        content = `<div style="${style}"><img src="${element.src}" alt="image" style="width: 100%; height: 100%; object-fit: cover;" /></div>`;
        break;
      case 'container':
        style += `background-color: ${element.backgroundColor};`;
        content = `<div style="${style}"></div>`;
        break;
    }
    return `<div class="${element.animation || ''}">${content}</div>`;
  };

  const pagesHtml = project.pages.map(page => {
    const pageStyle = `position: relative; width: 100vw; height: 100vh; background-color: ${page.backgroundColor}; ${page.backgroundImage ? `background-image: url(${page.backgroundImage}); background-size: cover; background-position: center;` : ''}`;
    const elementsHtml = page.elements.map(generateElementHtml).join('');
    const redirectAttr = page.redirect?.toPageId ? `data-redirect-to="${page.redirect.toPageId}" data-redirect-delay="${page.redirect.delay * 1000}"` : '';
    return `<div id="${page.id}" class="page" style="display: none; ${pageStyle}" ${redirectAttr}>${elementsHtml}</div>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Preview</title>
      <style>
        body, html { margin: 0; padding: 0; overflow: hidden; }
        .page { width: 100vw; height: 100vh; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .anim-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .anim-slide-in-up { animation: slideInUp 0.5s ease-out forwards; }
        .anim-pulse { animation: pulse 1.5s infinite ease-in-out; }
        .anim-pop { animation: pop 0.3s ease-out forwards; }
      </style>
    </head>
    <body>
      ${pagesHtml}
      <script>
        const pages = document.querySelectorAll('.page');
        let currentPageId = pages.length > 0 ? pages[0].id : null;
        let redirectTimer;

        function navigateTo(pageId) {
          const targetPage = document.getElementById(pageId);
          if (targetPage) {
            pages.forEach(p => p.style.display = 'none');
            targetPage.style.display = 'block';
            currentPageId = pageId;
            handleRedirect(targetPage);
          }
        }

        function handleRedirect(pageElement) {
            clearTimeout(redirectTimer);
            const redirectTo = pageElement.getAttribute('data-redirect-to');
            const delay = pageElement.getAttribute('data-redirect-delay');
            if (redirectTo && delay) {
                redirectTimer = setTimeout(() => {
                    navigateTo(redirectTo);
                }, parseInt(delay, 10));
            }
        }

        document.addEventListener('click', (e) => {
          const target = e.target;
          if (target.tagName === 'BUTTON') {
            const linkTo = target.getAttribute('data-link-to');
            if (linkTo) {
              navigateTo(linkTo);
            }
          }
        });
        
        // Initial page load
        if (currentPageId) {
            const initialPage = document.getElementById(currentPageId);
            if(initialPage) {
                initialPage.style.display = 'block';
                handleRedirect(initialPage);
            }
        }
      </script>
    </body>
    </html>
  `;
};

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
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: 'Could not generate code for the project.',
        });
      } finally {
        setIsBuilding(false);
      }
    }, 30000); // 30 seconds
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
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ura-project.html';
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
