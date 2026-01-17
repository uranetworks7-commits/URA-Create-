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
import { Blocks, File, FileText, Palette, Table, CheckCircle2 } from 'lucide-react';
import { Input } from '../ui/input';
import { pageTemplates } from '@/lib/templates';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Page } from '@/lib/types';
import { Label } from '../ui/label';

export default function EditorView() {
  const { state, dispatch } = useEditor();
  const [isStarted, setIsStarted] = useState(false);
  const [projectName, setProjectName] = useState('My Create-X Project');
  const [pageColor, setPageColor] = useState('#ffffff');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');

  const handleStartProject = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTemplate = pageTemplates.find(t => t.id === selectedTemplateId);
    if(selectedTemplate) {
        dispatch({ type: 'NEW_PROJECT_FROM_TEMPLATE', payload: { template: selectedTemplate, name: projectName } });
    } else { // 'blank'
        dispatch({ type: 'NEW_PROJECT', payload: { backgroundColor: pageColor, name: projectName } });
    }
    setIsStarted(true);
  };
  
  if (!isStarted && state.project.pages.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-3xl anim-pop">
          <CardHeader className="text-center">
            <div className="mx-auto bg-accent/20 p-2 rounded-full w-fit mb-2">
              <Blocks className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-xl font-bold">Create-X</CardTitle>
            <CardDescription className="text-sm">
              Start from a blank page or a pre-designed template.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleStartProject} className="space-y-3">
                 <div className="space-y-1">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input 
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter your project name"
                    />
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div 
                        className={cn(
                            "relative cursor-pointer rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:border-primary transition-all", 
                            selectedTemplateId === 'blank' && 'border-primary ring-2 ring-primary'
                        )} 
                        onClick={() => setSelectedTemplateId('blank')}
                    >
                         {selectedTemplateId === 'blank' && <CheckCircle2 className="h-4 w-4 absolute top-2 right-2 text-primary" />}
                         <div className="flex flex-col space-y-0.5">
                            <File className="h-4 w-4 mx-auto mb-1 text-accent"/>
                            <div className="text-sm text-center font-semibold leading-none tracking-tight">Blank Page</div>
                        </div>
                        <div className="mt-2">
                             <div className="flex items-center gap-2 border p-1 rounded-md">
                                <label htmlFor="page-color" className="text-xs font-medium flex items-center gap-1"><Palette className="h-3 w-3"/> Color:</label>
                                <Input type="color" id="page-color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="w-10 h-5 p-0.5"/>
                            </div>
                        </div>
                    </div>
                    {pageTemplates.map(template => (
                        <div 
                            key={template.id} 
                            className={cn(
                                "relative cursor-pointer rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:border-primary transition-all",
                                selectedTemplateId === template.id && 'border-primary ring-2 ring-primary'
                            )} 
                            onClick={() => setSelectedTemplateId(template.id)}
                        >
                            {selectedTemplateId === template.id && <CheckCircle2 className="h-4 w-4 absolute top-2 right-2 text-primary" />}
                            <div className="flex flex-col space-y-0.5">
                                {template.name === 'MCQ Page' && <FileText className="h-4 w-4 mx-auto mb-1 text-accent"/>}
                                {template.name === 'Table Page' && <Table className="h-4 w-4 mx-auto mb-1 text-accent"/>}
                                {template.name === 'Content Page' && <FileText className="h-4 w-4 mx-auto mb-1 text-accent"/>}
                                <div className="text-sm text-center font-semibold leading-none tracking-tight">{template.name}</div>
                            </div>
                            <div className="p-3 pt-0 mt-2">
                                <p className="text-[10px] text-center text-muted-foreground">{template.description}</p>
                            </div>
                        </div>
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
      <Header onStartNew={() => {
          dispatch({ type: 'LOAD_PROJECT', payload: { name: 'New Project', pages: [] } });
          setIsStarted(false);
        }} />
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
