'use client';

import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { FilePenLine, Plus, Trash2, Palette, Clock, Link as LinkIcon, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export default function PageManager() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex } = state;
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const currentPage = project.pages[currentPageIndex];

  if (!currentPage) return null;

  const handleSwitchPage = (index: number) => {
    if (editingPageId === project.pages[index].id) return;
    dispatch({ type: 'SWITCH_PAGE', payload: { pageIndex: index } });
  };

  const handleAddPage = () => {
    dispatch({ type: 'ADD_PAGE' });
  };

  const handleRenameStart = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setNewName(currentName);
  }

  const handleRenameSave = (pageId: string) => {
    if (newName.trim()) {
      dispatch({ type: 'UPDATE_PAGE', payload: { id: pageId, name: newName } });
    }
    setEditingPageId(null);
    setNewName('');
  }
  
  const handleDeletePage = (pageId: string) => {
      dispatch({type: 'DELETE_PAGE', payload: {pageId}});
  }

  const updatePage = (payload: Partial<typeof currentPage>) => {
    dispatch({ type: 'UPDATE_PAGE', payload: { id: currentPage.id, ...payload} });
  };

  return (
    <div className="w-full bg-card/50 rounded-lg p-2 border flex items-center gap-2">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2">
                {project.pages.map((page, index) => (
                    <Button
                        key={page.id}
                        variant={currentPageIndex === index ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handleSwitchPage(index)}
                        className={cn(
                        'shrink-0 h-9 px-4 py-2',
                        currentPageIndex === index && 'font-semibold'
                        )}
                    >
                        {page.name}
                    </Button>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleAddPage}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Page Settings</h4>
                        <p className="text-sm text-muted-foreground">
                        Adjust the settings for the current page.
                        </p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pageName" className="flex items-center gap-2">
                            <FilePenLine className="h-4 w-4"/> Page Name
                        </Label>
                        <Input id="pageName" value={currentPage.name} onChange={e => updatePage({ name: e.target.value })}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pageBgColor" className="flex items-center gap-2"><Palette className="h-4 w-4" />Background Color</Label>
                        <div className="flex items-center gap-2">
                        <Input id="pageBgColor" type="color" value={currentPage.backgroundColor} onChange={e => updatePage({ backgroundColor: e.target.value })} className="w-10 h-10 p-1"/>
                        <Input value={currentPage.backgroundColor} onChange={e => updatePage({ backgroundColor: e.target.value })}/>
                        </div>
                    </div>
                    <Separator/>
                    <p className="text-sm font-medium flex items-center gap-2"><LinkIcon className="h-4 w-4"/>Page Redirect</p>
                    <div className="space-y-2">
                        <Label>Redirect to</Label>
                        <Select value={currentPage.redirect?.toPageId || 'none'} onValueChange={(toPageId) => updatePage({ redirect: { toPageId: toPageId === 'none' ? '' : toPageId, delay: currentPage.redirect?.delay || 0 }})}>
                            <SelectTrigger><SelectValue placeholder="Select a page..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {project.pages.filter(p => p.id !== currentPage.id).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Clock className="h-4 w-4"/>Delay (seconds)</Label>
                        <Input type="number" value={currentPage.redirect?.delay || 0} onChange={e => updatePage({ redirect: { ...currentPage.redirect, delay: Number(e.target.value), toPageId: currentPage.redirect?.toPageId || '' }})} min="0" step="0.1"/>
                    </div>
                     <Separator/>
                     <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full" disabled={project.pages.length <=1}>
                                   <Trash2 className="mr-2 h-4 w-4"/> Delete Page
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this page and all its content.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePage(currentPage.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                </div>
            </PopoverContent>
        </Popover>
    </div>
  );
}
