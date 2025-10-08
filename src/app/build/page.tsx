'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FerrisWheel, Download, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { buildAndShareProject } from '@/ai/flows/build-and-share-flow';

export default function BuildPage() {
  const [buildState, setBuildState] = useState<'idle' | 'building' | 'finished' | 'error' | 'sharing' | 'shared'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Getting ready...');
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setBuildState('building');
    let progressInterval: NodeJS.Timeout;

    const storedProject = localStorage.getItem('ura-preview-project');
    if (!storedProject) {
        setBuildState('error');
        setStatusText('No project data found. Please go back to the editor.');
        return;
    }

    const project: Project = JSON.parse(storedProject);

    const statuses = [
        'Parsing project structure...',
        'Resolving dependencies...',
        'Generating HTML elements...',
        'Assembling CSS styles...',
        'Running script optimizations...',
        'Compiling TypeScript modules...',
        'Analyzing component tree...',
        'Implementing page navigation...',
        'Compressing assets...',
        'Finalizing build...',
    ];
    let statusIndex = 0;

    progressInterval = setInterval(() => {
        setProgress(prev => {
            const newProgress = prev + (100 - prev) * 0.05; // Slower progress
            if (newProgress > 99) {
                clearInterval(progressInterval);
                return 100;
            }
            if (newProgress > (statusIndex + 1) * (100 / statuses.length)) {
                statusIndex++;
                if(statuses[statusIndex]) {
                    setStatusText(statuses[statusIndex]);
                }
            }
            return newProgress;
        });
    }, 500);

    buildAndShareProject({ project, forShare: false }).then(result => {
        setTimeout(() => {
            if(result.htmlContent) {
               setGeneratedHtml(result.htmlContent);
               setStatusText('Project Built Successfully!');
               setBuildState('finished');
               clearInterval(progressInterval);
               setProgress(100);
            } else {
                throw new Error("Build process failed to generate HTML.");
            }
        }, 30000);
    }).catch (e => {
        console.error(e);
        setBuildState('error');
        setStatusText((e as Error).message || 'Could not generate code for the project.');
        clearInterval(progressInterval);
    });

    return () => clearInterval(progressInterval);
  }, []);

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    buildAndShareProject({ project: JSON.parse(localStorage.getItem('ura-preview-project')!), forShare: false, zip: true }).then(result => {
        if(result.zipContent) {
            const blob = new Blob([Buffer.from(result.zipContent, 'base64')], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const projectName = JSON.parse(localStorage.getItem('ura-preview-project')!).name || 'ura-project';
            a.download = `${projectName.toLowerCase().replace(/\s/g, '-')}.zip`;
            document.body.appendChild(a);
a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
  };

  const handleShare = () => {
      setBuildState('sharing');
      setStatusText('Uploading project for sharing...');
      buildAndShareProject({ project: JSON.parse(localStorage.getItem('ura-preview-project')!), forShare: true, zip: true }).then(result => {
          if (result.shareUrl) {
              setShareUrl(result.shareUrl);
              setBuildState('shared');
              setStatusText('Project shared successfully!');
          } else {
              setBuildState('error');
              setStatusText('Failed to share project.');
          }
      }).catch(e => {
          setBuildState('error');
          setStatusText((e as Error).message || 'Failed to share project.');
      });
  }
  
  const handleCopyUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Copied!', description: 'Share URL copied to clipboard.' });
  }

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl anim-pop">
        <CardHeader>
          <CardTitle>Project Builder</CardTitle>
          <CardDescription>
            {buildState === 'building' && 'Your project is being built. Please wait a moment.'}
            {buildState === 'finished' && 'Your project has been built successfully!'}
            {buildState === 'sharing' && 'Your project is being uploaded...'}
            {buildState === 'shared' && 'Your project is ready to be shared.'}
            {buildState === 'error' && 'An error occurred during the build process.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(buildState === 'building' || buildState === 'sharing') && (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
              <FerrisWheel className="h-10 w-10 animate-spin text-primary" />
              <div className="w-full text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{statusText}</p>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          )}
          {buildState === 'finished' && (
            <div className="space-y-3 text-center">
                 <p className="text-lg font-semibold text-accent">Build Complete!</p>
                 <div className="flex gap-4">
                    <Button onClick={handleDownloadZip} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download ZIP
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="w-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>
            </div>
          )}
          {buildState === 'shared' && shareUrl && (
             <div className="space-y-3 text-center">
                 <p className="text-lg font-semibold text-accent">Share this URL:</p>
                 <div className="flex gap-2">
                    <input readOnly value={shareUrl} className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background" />
                    <Button onClick={handleCopyUrl} size="icon" variant="outline"><Copy className="h-4 w-4"/></Button>
                 </div>
            </div>
          )}
          {buildState === 'error' && (
             <div className="space-y-3 text-center p-8 bg-destructive/10 rounded-md">
                 <p className="text-lg font-semibold text-destructive">Build Failed</p>
                 <p className="text-sm text-destructive-foreground">{statusText}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
