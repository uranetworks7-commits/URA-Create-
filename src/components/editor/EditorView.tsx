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
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-3xl anim-pop">
          <CardHeader className="text-center">
            <div className="mx-auto bg-accent/20 p-2 rounded-full w-fit mb-2">
              <Blocks className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">URA-Create</CardTitle>
            <CardDescription className="text-base">
              Start from a blank page or a pre-designed template.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleStartProject} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card 
                        className={cn(
                            "cursor-pointer hover:border-primary", 
                            !selectedTemplate && 'border-primary'
                        )} 
                        onClick={() => setSelectedTemplate(null)}
                    >
                         <CardHeader className="p-4">
                            <File className="h-5 w-5 mx-auto mb-1 text-accent"/>
                            <CardTitle className="text-base">Blank Page</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                             <div className="flex items-center gap-2 border p-1 rounded-md">
                                <label htmlFor="page-color" className="text-xs font-medium flex items-center gap-1"><Palette className="h-3 w-3"/> Color:</label>
                                <Input type="color" id="page-color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="w-12 h-6 p-0.5"/>
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
                            <CardHeader className="p-4">
                                {template.name === 'MCQ Page' && <FileText className="h-5 w-5 mx-auto mb-1 text-accent"/>}
                                {template.name === 'Table Page' && <Table className="h-5 w-5 mx-auto mb-1 text-accent"/>}
                                {template.name === 'Content Page' && <FileText className="h-5 w-5 mx-auto mb-1 text-accent"/>}
                                <CardTitle className="text-base">{template.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Button type="submit" size="sm" className="w-full">
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
        <main className="flex-1 flex flex-col overflow-auto p-1 sm:p-2 gap-2">
          <PageManager />
          <div className="flex-1 canvas-bg p-1 rounded-md">
            <Canvas />
          </div>
        </main>
        <Inspector />
      </div>
    </div>
  );
}
