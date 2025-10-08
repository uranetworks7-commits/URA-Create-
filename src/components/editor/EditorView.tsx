'use client';

import { useEditor } from '@/context/EditorContext';
import { useState } from 'react';
import Header from './Header';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import Inspector from './Inspector';
import PageTabs from './PageTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paintbrush, FileText, Blocks, Palette } from 'lucide-react';
import { Input } from '../ui/input';

export default function EditorView() {
  const { state, dispatch } = useEditor();
  const [isStarted, setIsStarted] = useState(false);
  const [pageColor, setPageColor] = useState('#ffffff');

  const handleStartProject = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'NEW_PROJECT', payload: { backgroundColor: pageColor } });
    setIsStarted(true);
  };
  
  if (!isStarted && state.project.pages.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-8">
        <Card className="w-full max-w-2xl anim-pop">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
              <Blocks className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">URA Web Canvas</CardTitle>
            <CardDescription className="text-lg">
              Bring your ideas to life with a visual web page builder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <Paintbrush className="h-6 w-6 mx-auto mb-2 text-accent"/>
                <h3 className="font-semibold">Visual Editor</h3>
                <p className="text-sm text-muted-foreground">Drag, drop, and design. No code required.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-accent"/>
                <h3 className="font-semibold">Templates</h3>
                <p className="text-sm text-muted-foreground">Start from a blank slate or a pre-designed page.</p>
              </div>
            </div>
            <form onSubmit={handleStartProject} className="space-y-4">
                <div className="flex items-center gap-2 border p-2 rounded-lg">
                    <label htmlFor="page-color" className="text-sm font-medium flex items-center gap-2"><Palette className="h-4 w-4"/> Start with a page color:</label>
                    <Input type="color" id="page-color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="w-16 h-8 p-1"/>
                </div>
                <Button type="submit" size="lg" className="w-full">
                    Start with a Blank Page
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
          <div className="flex-1 canvas-bg p-2 rounded-lg">
            <Canvas />
          </div>
          <PageTabs />
        </main>
        <Inspector />
      </div>
    </div>
  );
}
