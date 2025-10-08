'use client';

import { Button } from '@/components/ui/button';
import { Blocks, FilePlus, Loader2, Save, FolderOpen, Settings, Undo2, Redo2, Trash2, Grid, HelpCircle } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { useState, useEffect } from 'react';
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
import { Checkbox } from '../ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export default function Header({ onStartNew }: { onStartNew: () => void }) {
  const { state, dispatch } = useEditor();
  const { toast } = useToast();
  
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const [accessId, setAccessId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<ProjectWithId[]>([]);
  const [selectedCloudProject, setSelectedCloudProject] = useState<ProjectWithId | null>(null);
  
  const [saveAccessId, setSaveAccessId] = useState('');
  const [saveProjectName, setSaveProjectName] = useState(state.project.name);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithId | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteAgreed, setDeleteAgreed] = useState(false);

  useEffect(() => {
    if (isSaveDialogOpen) {
      setSaveProjectName(state.project.name);
    }
  }, [isSaveDialogOpen, state.project.name]);
  
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
       if (!saveProjectName.trim()) {
        toast({ variant: 'destructive', title: 'Invalid Name', description: 'Project name cannot be empty.' });
        return;
      }

      setIsSaving(true);
      
      const projectToSave = {
        ...state.project,
        name: saveProjectName,
      };

      try {
        const savedProject = await saveProjectToDb(saveAccessId, projectToSave, null, false);
        dispatch({ type: 'UPDATE_PROJECT_NAME', payload: { name: saveProjectName } });
        toast({ title: 'Project Saved!', description: `Saved "${savedProject.project.name}" to ID: ${saveAccessId}` });
        setIsSaveDialogOpen(false);
        setSaveAccessId('');
      } catch(e) {
        if ((e as Error).message.includes('Project name already exists')) {
             const confirmOverwrite = window.confirm(`A project named "${saveProjectName}" already exists. Do you want to overwrite it?`);
             if (confirmOverwrite) {
                const projects = await loadProjectsFromDb(saveAccessId);
                const existing = projects.find(p => p.project.name === saveProjectName);
                if (existing) {
                    await saveProjectToDb(saveAccessId, projectToSave, existing.id, true);
                    dispatch({ type: 'UPDATE_PROJECT_NAME', payload: { name: saveProjectName } });
                    toast({ title: 'Project Overwritten!', description: `Updated "${saveProjectName}"` });
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

  const handleDeleteProject = async () => {
    if (!projectToDelete || !accessId) return;
    try {
      await deleteProjectFromDb(accessId, projectToDelete.id);
      toast({ title: 'Project Deleted', description: `"${projectToDelete.project.name}" has been removed.` });
      setCloudProjects(cloudProjects.filter(p => p.id !== projectToDelete.id));
      if (selectedCloudProject?.id === projectToDelete.id) {
        setSelectedCloudProject(null);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: (e as Error).message });
    } finally {
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      setDeleteConfirmation('');
      setDeleteAgreed(false);
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
      <div className="flex items-center gap-1">
        <Blocks className="h-3 w-3 text-accent" />
        <h1 className="text-[10px] font-bold tracking-tighter">URA-Create</h1>
         <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-7 w-7"><HelpCircle className="h-4 w-4 text-muted-foreground"/></Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>URA-Create User Manual</DialogTitle>
                    <DialogDescription>A guide to all the tools and features in the editor.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] p-2">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Toolbar: Object & View Tools</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                                <p><strong>Move Tool:</strong> Select an element on the canvas to enable this. Use the arrow buttons to move the element by the specified "Speed" increment.</p>
                                <p><strong>Size Tool:</strong> Select an element to enable. Quickly resize the element to 2x or 0.5x its current size, or reset it to its original size.</p>
                                <p><strong>Zoom Tool:</strong> Zoom in or out of the canvas for a better view. The current zoom level is displayed.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Toolbar: Add Elements</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                                <p><strong>Add Text:</strong> Adds a new text box to the canvas.</p>
                                <p><strong>Add Button:</strong> Adds a new button to the canvas.</p>
                                <p><strong>Add Media:</strong> Opens a dialog to add an image or video from your computer or a URL.</p>
                                <p><strong>Add Animation:</strong> Adds a special effect like Fireworks, Confetti, or Sparks to the page.</p>
                                <p><strong>Add Sticker:</strong> Opens a menu to add a fun emoji sticker to the canvas.</p>
                                <p><strong>Add Container:</strong> Adds a basic rectangular shape that can be used for backgrounds or layout.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Toolbar: Templates & Actions</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                               <p><strong>Templates (MCQ, Table, Content):</strong> Adds a pre-built set of elements to the canvas to give you a head start on common layouts.</p>
                               <p><strong>Preview Project:</strong> Opens a dialog to preview your interactive project exactly as a user would see it.</p>
                               <p><strong>Build Project:</strong> Navigates to a page where your project is compiled and can be downloaded as a ZIP file or shared.</p>
                               <p><strong>Quick Builder:</strong> Generates the complete HTML code for your project for you to copy or download.</p>
                               <p><strong>Share Project:</strong> Allows you to save your project to the cloud with a 6-digit ID so you can share it or load it later.</p>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-4">
                            <AccordionTrigger>Page Management</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                                <p><strong>Page Tabs:</strong> Click on a page name to switch to it. Click the '+' button to add a new blank page.</p>
                                <p><strong>Page Settings (ellipsis button):</strong> Opens a popover with detailed settings for the currently selected page.</p>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-5">
                            <AccordionTrigger>Page Settings Panel</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                                <p><strong>Page Name:</strong> Change the name of the current page.</p>
                                <p><strong>Background Color/Image:</strong> Set a solid color or a background image URL for the page.</p>
                                <p><strong>Background Audio:</strong> Add background music or sound effects from a URL. You can also set it to loop.</p>
                                <p><strong>Apply to all pages:</strong> Copies the current page's background and audio settings to all other pages in your project.</p>
                                <p><strong>Page Redirect:</strong> Automatically navigate to another page after a set delay (in seconds).</p>
                                <p><strong>Custom HTML:</strong> Switch to a mode where you can input your own HTML for the page preview. This disables the visual editor for that page.</p>
                                <p><strong>Build from HTML:</strong> Use this to provide a complete HTML document that will be used for this page in the final build, overriding all visual content.</p>
                                <p><strong>Delete Page:</strong> Permanently deletes the current page. You cannot delete the last remaining page.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Element Settings Panel</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                               <p>When you select an element, a settings panel appears on the right (you may need to click the 'Settings' gear icon in the header to open it). This panel lets you fine-tune the selected element.</p>
                                <p><strong>Common Settings:</strong> Name, Rotation, Animation (with loop toggle), Duplicate, Delete.</p>
                                <p><strong>Text/Button Settings:</strong> Text content, font size, weight, and color.</p>
                                <p><strong>Button/Container Settings:</strong> Background color.</p>
                                <p><strong>Button-Specific Settings:</strong> Shape, border radius, and linking to another page.</p>
                                <p><strong>Image/Video Settings:</strong> Change the source URL and see the element's dimensions.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </ScrollArea>
            </DialogContent>
        </Dialog>
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
            variant={state.showGrid ? 'secondary' : 'ghost'} 
            size="icon"
            onClick={() => dispatch({type: 'TOGGLE_GRID'})}
            aria-label="Toggle Grid"
            className="h-7 w-7"
          >
            <Grid />
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

        <Button variant="outline" size="sm" onClick={onStartNew}><FilePlus className="mr-1" /> New</Button>
        
        {/* Load Dialog */}
        <Dialog open={isLoadDialogOpen} onOpenChange={(open) => {
            setIsLoadDialogOpen(open);
            if (!open) resetLoadState();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="mr-1" /> Load
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
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => {
                                            e.stopPropagation();
                                            setProjectToDelete(p);
                                            setIsDeleteDialogOpen(true);
                                        }}>
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
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
                  <Save className="mr-1" /> Save
                </Button>
            </DialogTrigger>
             <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                <DialogTitle>Save Project</DialogTitle>
                <DialogDescription>Enter a 6-digit ID to save your project. Anyone with this ID can load it.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="save-name">Project Name</Label>
                        <Input id="save-name" value={saveProjectName} onChange={(e) => setSaveProjectName(e.target.value)} placeholder="My Awesome Project" />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="save-id">Project ID</Label>
                        <Input id="save-id" value={saveAccessId} onChange={(e) => setSaveAccessId(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g., 123456" maxLength={6} />
                    </div>
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
    
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project
            <span className="font-semibold text-foreground">"{projectToDelete?.project.name}"</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
            <Label>To confirm, type "DELETE" below:</Label>
            <Input 
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder='DELETE'
                className="font-mono"
            />
            <div className="flex items-center space-x-2">
                <Checkbox id="agree-delete" checked={deleteAgreed} onCheckedChange={(checked) => setDeleteAgreed(Boolean(checked))} />
                <Label htmlFor="agree-delete" className="text-xs">I understand this action is irreversible.</Label>
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setProjectToDelete(null);
            setDeleteConfirmation('');
            setDeleteAgreed(false);
          }}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteProject} 
            className="bg-destructive hover:bg-destructive/90"
            disabled={deleteConfirmation !== 'DELETE' || !deleteAgreed}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
