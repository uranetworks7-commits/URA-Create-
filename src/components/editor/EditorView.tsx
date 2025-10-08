'use client';

import { useEditor } from '@/context/EditorContext';
import { useState } from 'react';
import Header from './Header';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import Inspector from './Inspector';
import PageManager from './PageManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Blocks, File, FileText, Palette, Table } from 'lucide-react';
import { Input } from '../ui/input';
import { pageTemplates } from '@/lib/templates';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Page } from '@/lib/types';

export default function EditorView() {
  const { state, dispatch } = useEditor();
  const [isStarted, setIsStarted] = useState(false);
  const [pageColor, setPageColor] = useState('#ffffff');
  const [selectedTemplate, setSelectedTemplate] = useState<Page | null>(null);

  const handleStartProject = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedTemplate) {
        dispatch({ type: 'NEW_PROJECT_FROM_TEMPLATE', payload: { template: selectedTemplate } });
    } else {
        dispatch({ type: 'NEW_PROJECT', payload: { backgroundColor: pageColor } });
    }
    setIsStarted(true);
    setSelectedTemplate(null);
  };
  
  if (!isStarted && state.project.pages.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-8">
        <Card className="w-full max-w-4xl anim-pop">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
              <Blocks className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">URA Web Canvas</CardTitle>
            <CardDescription className="text-lg">
              Start from a blank page or a pre-designed template.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleStartProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card 
                        className={cn(
                            "cursor-pointer hover:border-primary", 
                            !selectedTemplate && 'border-primary'
                        )} 
                        onClick={() => setSelectedTemplate(null)}
                    >
                         <CardHeader>
                            <File className="h-6 w-6 mx-auto mb-2 text-accent"/>
                            <CardTitle className="text-lg">Blank Page</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2 border p-2 rounded-lg">
                                <label htmlFor="page-color" className="text-sm font-medium flex items-center gap-2"><Palette className="h-4 w-4"/> Color:</label>
                                <Input type="color" id="page-color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="w-16 h-8 p-1"/>
                            </div>
                        </CardContent>
                    </Card>
                    {pageTemplates.map(template => (
                        <Card 
                            key={template.id} 
                            className={cn(
                                "cursor-pointer hover:border-primary",
                                selectedTemplate?.id === template.id && 'border-primary'
                            )} 
                            onClick={() => setSelectedTemplate(template)}
                        >
                            <CardHeader>
                                {template.name === 'MCQ Page' && <FileText className="h-6 w-6 mx-auto mb-2 text-accent"/>}
                                {template.name === 'Table Page' && <Table className="h-6 w-6 mx-auto mb-2 text-accent"/>}
                                {template.name === 'Content Page' && <FileText className="h-6 w-6 mx-auto mb-2 text-accent"/>}
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Button type="submit" size="lg" className="w-full">
                    Start Designing
                </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen w-screen flex-col bg-muted/30 dark:bg-card/20 text-foreground font-sans">
      <Header onStartNew={() => setIsStarted(false)} />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <main className="flex-1 flex flex-col overflow-auto p-2 sm:p-4 gap-4">
          <PageManager />
          <div className="flex-1 canvas-bg p-2 rounded-lg">
            <Canvas />
          </div>
        </main>
        <Inspector />
      </div>
    </div>
  );
}
