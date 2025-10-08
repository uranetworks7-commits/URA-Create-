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
import { loadProjectsFromDb, saveProjectToDb, type ProjectWithId, deleteProjectFromDb } from '@/lib/firebase';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { Project } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { ScrollArea } from '../ui/scroll-area';

export default function Header({ onStartNew }: { onStartNew: () => void }) {
  const { state, dispatch } = useEditor();
  const { toast } = useToast();
  
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  const [accessId, setAccessId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<ProjectWithId[]>([]);
  const [selectedCloudProject, setSelectedCloudProject] = useState<ProjectWithId | null>(null);
  
  const [saveAccessId, setSaveAccessId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleAccessIdSubmit = async () => {
    if (accessId.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid ID', description: 'Access ID must be 6 digits.' });
      return;
    }
    setIsLoading(true);
    try {
      const projects = await loadProjectsFromDb(accessId);
      setCloudProjects(projects);
      if(projects.length === 0) {
        toast({ title: 'No projects found', description: 'This ID is empty.' });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = () => {
    if (!selectedCloudProject) return;
    dispatch({ type: 'LOAD_PROJECT', payload: selectedCloudProject.project });
    toast({ title: 'Project Loaded!', description: `Loaded "${selectedCloudProject.project.name}"` });
    setIsLoadDialogOpen(false);
    resetLoadState();
  };

  const handleSaveProject = async () => {
      if (saveAccessId.length !== 6) {
        toast({ variant: 'destructive', title: 'Invalid ID', description: 'Access ID must be 6 digits.' });
        return;
      }
      setIsSaving(true);
      try {
        const savedProject = await saveProjectToDb(saveAccessId, state.project, null, false);
        toast({ title: 'Project Saved!', description: `Saved "${savedProject.project.name}" to ID: ${saveAccessId}` });
        setIsSaveDialogOpen(false);
        setSaveAccessId('');
      } catch(e) {
        if ((e as Error).message.includes('Project name already exists')) {
             const confirmOverwrite = window.confirm(`A project named "${state.project.name}" already exists. Do you want to overwrite it?`);
             if (confirmOverwrite) {
                const projects = await loadProjectsFromDb(saveAccessId);
                const existing = projects.find(p => p.project.name === state.project.name);
                if (existing) {
                    await saveProjectToDb(saveAccessId, state.project, existing.id, true);
                    toast({ title: 'Project Overwritten!', description: `Updated "${state.project.name}"` });
                    setIsSaveDialogOpen(false);
                    setSaveAccessId('');
                }
             }
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: (e as Error).message });
        }
      } finally {
        setIsSaving(false);
      }
  }

  const resetLoadState = () => {
    setAccessId('');
    setCloudProjects([]);
    setSelectedCloudProject(null);
    setIsLoading(false);
  }

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;
  
  return (
    <>
    <header className="flex h-10 items-center justify-between border-b bg-card px-2 z-10 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Blocks className="h-5 w-5 text-accent" />
        <h1 className="text-base font-bold tracking-tight">URA-Create</h1>
      </div>
      <div className="flex items-center gap-1">
         <Button 
            variant="ghost" 
            size="icon"
            onClick={() => dispatch({type: 'UNDO'})}
            disabled={!canUndo}
            aria-label="Undo"
            className="h-7 w-7"
          >
            <Undo2 />
        </Button>
        <Button 
            variant="ghost" 
            size="icon"
            onClick={() => dispatch({type: 'REDO'})}
            disabled={!canRedo}
            aria-label="Redo"
            className="h-7 w-7"
          >
            <Redo2 />
        </Button>

        <Button 
            variant="ghost" 
            size="icon"
            onClick={() => dispatch({type: 'TOGGLE_SETTINGS'})}
            disabled={!state.selectedElementId}
            aria-label="Element Settings"
            className="h-7 w-7"
          >
            <Settings />
          </Button>

        <Button variant="outline" size="sm" onClick={onStartNew}><FilePlus className="mr-1 h-3 w-3" /> New</Button>
        
        {/* Load Dialog */}
        <Dialog open={isLoadDialogOpen} onOpenChange={(open) => {
            setIsLoadDialogOpen(open);
            if (!open) resetLoadState();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="mr-1 h-3 w-3" /> Load
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Load Project</DialogTitle>
              <DialogDescription>Enter a 6-digit ID to load your projects.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input 
                id="access-id-load" 
                value={accessId} 
                onChange={(e) => setAccessId(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                placeholder="e.g., 123456" 
                maxLength={6} 
                disabled={cloudProjects.length > 0}
              />
              <Button onClick={handleAccessIdSubmit} disabled={isLoading || cloudProjects.length > 0}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Go'}
              </Button>
            </div>
            
            {cloudProjects.length > 0 && (
                 <div className="space-y-3 pt-2">
                     <p className="text-sm font-medium">Projects at ID: {accessId}</p>
                     <ScrollArea className="h-40 rounded-md border">
                        <div className="p-2">
                            <RadioGroup value={selectedCloudProject?.id} onValueChange={(id) => setSelectedCloudProject(cloudProjects.find(p => p.id === id) || null)}>
                                {cloudProjects.map(p => (
                                    <div key={p.id} className="flex items-center justify-between text-sm p-1 rounded-md hover:bg-muted">
                                        <Label htmlFor={p.id} className="flex-1 cursor-pointer">{p.project.name}</Label>
                                        <RadioGroupItem value={p.id} id={p.id} />
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                     </ScrollArea>
                    <DialogFooter>
                         <Button onClick={handleLoadProject} disabled={!selectedCloudProject || isLoading} size="sm">Load Selected</Button>
                    </DialogFooter>
                 </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Save Dialog */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="mr-1 h-3 w-3" /> Save
                </Button>
            </DialogTrigger>
             <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                <DialogTitle>Save Project</DialogTitle>
                <DialogDescription>Enter a 6-digit ID to save your project. Anyone with this ID can load it.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="save-id">Project ID</Label>
                    <Input id="save-id" value={saveAccessId} onChange={(e) => setSaveAccessId(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g., 123456" maxLength={6} />
                </div>
                <DialogFooter>
                <Button onClick={handleSaveProject} disabled={isSaving} size="sm">
                    {isSaving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Save
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </header>
    </>
  );
}
