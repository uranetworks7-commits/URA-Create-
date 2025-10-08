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
import { loadProjectsFromDb, saveProjectToDb, type ProjectWithId } from '@/lib/firebase';
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


export default function Header({ onStartNew }: { onStartNew: () => void }) {
  const { state, dispatch } = useEditor();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState<'save' | 'load' | null>(null);

  // For conflict resolution
  const [conflictingProjects, setConflictingProjects] = useState<ProjectWithId[]>([]);
  const [selectedProjectToLoad, setSelectedProjectToLoad] = useState<string | null>(null);
  const [showLoadConflictDialog, setShowLoadConflictDialog] = useState(false);

  const [saveConflict, setSaveConflict] = useState<ProjectWithId | null>(null);
  const [showSaveConflictDialog, setShowSaveConflictDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');


  const handleSave = async () => {
    if (projectId.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid ID', description: 'Project ID must be 6 digits.' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await saveProjectToDb(projectId, state.project);
      if (result.status === 'conflict') {
        setSaveConflict(result.conflictingProject!);
        setNewProjectName(state.project.name);
        setShowSaveConflictDialog(true);
      } else {
        toast({ title: 'Project Saved!', description: `Your project is saved under ID: ${projectId}` });
        setIsDialogOpen(null);
      }
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
      const projects = await loadProjectsFromDb(projectId);
      if (projects.length === 0) {
        toast({ variant: 'destructive', title: 'Not Found', description: 'No project found with that ID.' });
      } else if (projects.length === 1) {
        dispatch({ type: 'LOAD_PROJECT', payload: projects[0].project });
        toast({ title: 'Project Loaded!', description: `Successfully loaded project ID: ${projectId}` });
        setIsDialogOpen(null);
      } else {
        // Multiple projects found, show selection dialog
        setConflictingProjects(projects);
        setSelectedProjectToLoad(projects[0].id);
        setShowLoadConflictDialog(true);
      }
    } catch (e) {
      const error = e as Error;
      toast({ variant: 'destructive', title: 'Load Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmLoadConflict = () => {
    if (selectedProjectToLoad) {
      const projectToLoad = conflictingProjects.find(p => p.id === selectedProjectToLoad);
      if (projectToLoad) {
        dispatch({ type: 'LOAD_PROJECT', payload: projectToLoad.project });
        toast({ title: 'Project Loaded!', description: `Successfully loaded project ID: ${projectId}` });
      }
    }
    setShowLoadConflictDialog(false);
    setConflictingProjects([]);
    setIsDialogOpen(null);
  };
  
  const handleResolveSaveConflict = async (resolution: 'replace' | 'rename' | 'autoname') => {
    setIsLoading(true);
    let projectToSave: Project = { ...state.project };
    let shouldReplace = false;

    if (resolution === 'rename') {
        if (!newProjectName || newProjectName.trim() === '') {
            toast({ variant: 'destructive', title: 'Invalid Name', description: 'Project name cannot be empty.'});
            setIsLoading(false);
            return;
        }
        projectToSave.name = newProjectName;
    } else if (resolution === 'replace') {
        shouldReplace = true;
    }
    // Autoname is handled on the backend now

    try {
        const result = await saveProjectToDb(projectId, projectToSave, resolution, saveConflict?.id);

        if (result.status === 'success') {
            toast({ title: 'Project Saved!', description: `Project was saved successfully to ID: ${projectId}` });
            setShowSaveConflictDialog(false);
            setSaveConflict(null);
            setIsDialogOpen(null);
        } else {
             // This case should ideally not be hit if backend logic is correct
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not resolve save conflict.' });
        }
    } catch (e) {
        const error = e as Error;
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally {
        setIsLoading(false);
    }
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
        
        <Dialog open={isDialogOpen === 'save'} onOpenChange={(open) => !open && setIsDialogOpen(null)}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen('save')}>
              <Save className="mr-1 h-3 w-3" /> Save
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Save Project</DialogTitle>
              <DialogDescription>Enter a 6-digit ID to save your project. Anyone with this ID can access it.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="save-id">Project ID</Label>
              <Input id="save-id" value={projectId} onChange={(e) => setProjectId(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g., 123456" maxLength={6} />
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isLoading} size="sm">
                {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isDialogOpen === 'load'} onOpenChange={(open) => !open && setIsDialogOpen(null)}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen('load')}>
              <FolderOpen className="mr-1 h-3 w-3" /> Load
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Load Project</DialogTitle>
              <DialogDescription>Enter the 6-digit ID of the project you want to load.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="load-id">Project ID</Label>
              <Input id="load-id" value={projectId} onChange={(e) => setProjectId(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g., 123456" maxLength={6} />
            </div>
            <DialogFooter>
              <Button onClick={handleLoad} disabled={isLoading} size="sm">
                {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Load
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </header>

    {/* Load Conflict Dialog */}
    <Dialog open={showLoadConflictDialog} onOpenChange={setShowLoadConflictDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Multiple Projects Found</DialogTitle>
                <DialogDescription>Select which project you'd like to load from ID: {projectId}</DialogDescription>
            </DialogHeader>
            <RadioGroup value={selectedProjectToLoad || ''} onValueChange={setSelectedProjectToLoad} className="py-4">
                {conflictingProjects.map(p => (
                    <div key={p.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={p.id} id={p.id} />
                        <Label htmlFor={p.id}>{p.project.name}</Label>
                    </div>
                ))}
            </RadioGroup>
            <DialogFooter>
                <Button onClick={handleConfirmLoadConflict} disabled={!selectedProjectToLoad}>Load Selected</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    {/* Save Conflict Dialog */}
    <AlertDialog open={showSaveConflictDialog} onOpenChange={setShowSaveConflictDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Project Name Conflict</AlertDialogTitle>
          <AlertDialogDescription>
            A project named "{saveConflict?.project.name}" already exists at this ID. How would you like to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
            <Button className="w-full" onClick={() => handleResolveSaveConflict('replace')}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Replace Existing Project'}
            </Button>
             <Button className="w-full" variant="secondary" onClick={() => handleResolveSaveConflict('autoname')}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save as New Version (Auto-name)'}
            </Button>
            <div className="space-y-2">
                <Label htmlFor="new-name">Or rename your project:</Label>
                <div className="flex gap-2">
                    <Input id="new-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                    <Button onClick={() => handleResolveSaveConflict('rename')} disabled={isLoading}>
                         {isLoading ? <Loader2 className="animate-spin" /> : 'Save with New Name'}
                    </Button>
                </div>
            </div>
        </div>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
