'use client';

import { Button } from '@/components/ui/button';
import { Blocks, FilePlus, Loader2, Save, FolderOpen, Settings, Undo2, Redo2, Cloud, Trash2 } from 'lucide-react';
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
import { Separator } from '../ui/separator';

export default function Header({ onStartNew }: { onStartNew: () => void }) {
  const { state, dispatch } = useEditor();
  const { toast } = useToast();
  const [isCloudDialogOpen, setIsCloudDialogOpen] = useState(false);
  const [accessId, setAccessId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<ProjectWithId[]>([]);
  const [selectedCloudProject, setSelectedCloudProject] = useState<ProjectWithId | null>(null);
  const [showOverwriteAlert, setShowOverwriteAlert] = useState(false);
  
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
        toast({ title: 'No projects found', description: 'This ID is empty. You can save a new project here.' });
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
    setIsCloudDialogOpen(false);
    resetCloudState();
  };
  
  const handleSaveProject = () => {
      const projectToSave = state.project;
      const existingProject = cloudProjects.find(p => p.project.name === projectToSave.name);

      if (existingProject) {
          setSelectedCloudProject(existingProject);
          setShowOverwriteAlert(true);
      } else {
          executeSave(projectToSave);
      }
  }

  const executeSave = async (project: Project, overwrite = false, existingId?: string) => {
    setIsLoading(true);
    try {
      const savedProject = await saveProjectToDb(accessId, project, existingId, overwrite);
      toast({ title: 'Project Saved!', description: `Saved "${savedProject.project.name}"` });
      
      // Refresh project list
      const projects = await loadProjectsFromDb(accessId);
      setCloudProjects(projects);

    } catch (e) {
       toast({ variant: 'destructive', title: 'Save Failed', description: (e as Error).message });
    } finally {
      setIsLoading(false);
      setShowOverwriteAlert(false);
      setSelectedCloudProject(null);
    }
  }
  
  const handleDeleteProject = async (project: ProjectWithId | null) => {
    if (!project) return;
    setIsLoading(true);
    try {
      await deleteProjectFromDb(accessId, project.id);
      toast({ title: 'Project Deleted' });
      const projects = await loadProjectsFromDb(accessId);
      setCloudProjects(projects);
      setSelectedCloudProject(null);
    } catch (e) {
       toast({ variant: 'destructive', title: 'Delete Failed', description: (e as Error).message });
    } finally {
        setIsLoading(false);
    }
  }

  const resetCloudState = () => {
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
        
        <Dialog open={isCloudDialogOpen} onOpenChange={(open) => {
            setIsCloudDialogOpen(open);
            if (!open) resetCloudState();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsCloudDialogOpen(true)}>
              <Cloud className="mr-1 h-3 w-3" /> Cloud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cloud Storage</DialogTitle>
              <DialogDescription>Enter a 6-digit ID to access your projects.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input 
                id="access-id" 
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
            
            {accessId.length === 6 && (
                 <div className="space-y-3 pt-2">
                    <Separator/>
                     <p className="text-sm font-medium">Projects at ID: {accessId}</p>
                     <ScrollArea className="h-40 rounded-md border">
                        <div className="p-2">
                            {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
                            {!isLoading && cloudProjects.length === 0 && (
                                <p className="text-sm text-muted-foreground p-4 text-center">No projects found.</p>
                            )}
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
                    <DialogFooter className="!justify-between">
                         <div className="flex gap-2">
                            <Button onClick={handleLoadProject} disabled={!selectedCloudProject || isLoading} size="sm">Load</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-7 w-7" disabled={!selectedCloudProject || isLoading}><Trash2 /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete "{selectedCloudProject?.project.name}". This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteProject(selectedCloudProject)} className="bg-destructive hover:bg-destructive/90">
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Delete'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                         <Button onClick={handleSaveProject} disabled={isLoading} size="sm">Save Current Project</Button>
                    </DialogFooter>
                 </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </header>

     <AlertDialog open={showOverwriteAlert} onOpenChange={setShowOverwriteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Project Name Conflict</AlertDialogTitle>
          <AlertDialogDescription>
            A project named "{state.project.name}" already exists. How would you like to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-2">
            <Button className="w-full" onClick={() => executeSave(state.project, true, selectedCloudProject?.id)}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Overwrite Existing Project'}
            </Button>
             <Button className="w-full" variant="secondary" onClick={() => executeSave(state.project)}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save as a New Copy (Auto-Renamed)'}
            </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
