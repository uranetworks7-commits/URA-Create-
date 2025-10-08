'use client';

import { Button } from '@/components/ui/button';
import { Blocks, FilePlus, Loader2, Save, FolderOpen, Settings, Undo2, Redo2 } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loadProjectFromDb, saveProjectToDb } from '@/lib/firebase';

export default function Header({ onStartNew }: { onStartNew: () => void }) {
  const { state, dispatch } = useEditor();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState<'save' | 'load' | null>(null);

  const handleSave = async () => {
    if (projectId.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid ID', description: 'Project ID must be 6 digits.' });
      return;
    }
    setIsLoading(true);
    try {
      await saveProjectToDb(projectId, state.project);
      toast({ title: 'Project Saved!', description: `Your project is saved under ID: ${projectId}` });
      setIsDialogOpen(null);
    } catch (e) {
      const error = e as Error;
      toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async () => {
    if (projectId.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid ID', description: 'Project ID must be 6 digits.' });
      return;
    }
    setIsLoading(true);
    try {
      const project = await loadProjectFromDb(projectId);
      if (project) {
        dispatch({ type: 'LOAD_PROJECT', payload: project });
        toast({ title: 'Project Loaded!', description: `Successfully loaded project ID: ${projectId}` });
        setIsDialogOpen(null);
      } else {
        toast({ variant: 'destructive', title: 'Not Found', description: 'No project found with that ID.' });
      }
    } catch (e) {
      const error = e as Error;
      toast({ variant: 'destructive', title: 'Load Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;
  
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <Blocks className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-xl font-bold tracking-tight">URA-Create</h1>
      </div>
      <div className="flex items-center gap-2">
         <Button 
            variant="ghost" 
            size="icon"
            onClick={() => dispatch({type: 'UNDO'})}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 />
        </Button>
        <Button 
            variant="ghost" 
            size="icon"
            onClick={() => dispatch({type: 'REDO'})}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo2 />
        </Button>

        <Button 
            variant="ghost" 
            size="icon"
            onClick={() => dispatch({type: 'TOGGLE_SETTINGS'})}
            disabled={!state.selectedElementId}
            aria-label="Element Settings"
          >
            <Settings />
          </Button>

        <Button variant="outline" size="sm" onClick={onStartNew}><FilePlus className="mr-2 h-4 w-4" /> New</Button>
        
        <Dialog open={isDialogOpen === 'save'} onOpenChange={(open) => !open && setIsDialogOpen(null)}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen('save')}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Project</DialogTitle>
              <DialogDescription>Enter a 6-digit ID to save your project. Anyone with this ID can access it.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="save-id">Project ID</Label>
              <Input id="save-id" value={projectId} onChange={(e) => setProjectId(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g., 123456" maxLength={6} />
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isDialogOpen === 'load'} onOpenChange={(open) => !open && setIsDialogOpen(null)}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen('load')}>
              <FolderOpen className="mr-2 h-4 w-4" /> Load
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Project</DialogTitle>
              <DialogDescription>Enter the 6-digit ID of the project you want to load.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="load-id">Project ID</Label>
              <Input id="load-id" value={projectId} onChange={(e) => setProjectId(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g., 123456" maxLength={6} />
            </div>
            <DialogFooter>
              <Button onClick={handleLoad} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </header>
  );
}
