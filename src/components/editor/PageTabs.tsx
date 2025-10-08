'use client';

import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { FilePenLine, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react';
import { Input } from '../ui/input';
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

export default function PageTabs() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex } = state;
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleSwitchPage = (index: number) => {
    if (editingPageId === project.pages[index].id) return;
    dispatch({ type: 'SWITCH_PAGE', payload: { pageIndex: index } });
  };

  const handleAddPage = () => {
    dispatch({ type: 'ADD_PAGE' });
  };

  const handleRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setNewName(currentName);
  }

  const handleSaveRename = (pageId: string) => {
    if (newName.trim()) {
      dispatch({ type: 'UPDATE_PAGE', payload: { id: pageId, name: newName } });
    }
    setEditingPageId(null);
    setNewName('');
  }
  
  const handleDeletePage = (pageId: string) => {
      dispatch({type: 'DELETE_PAGE', payload: {pageId}});
  }

  return (
    <div className="w-full bg-card/50 rounded-lg p-2 border">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2">
                {project.pages.map((page, index) => (
                <DropdownMenu key={page.id}>
                    <DropdownMenuTrigger asChild>
                         <Button
                            variant={currentPageIndex === index ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleSwitchPage(index)}
                            className={cn(
                            'shrink-0 h-9 px-4 py-2',
                            currentPageIndex === index && 'font-semibold'
                            )}
                        >
                           {editingPageId === page.id ? (
                                <Input 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onBlur={() => handleSaveRename(page.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(page.id)}
                                    autoFocus
                                    className="h-7 w-24"
                                />
                           ) : page.name}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleRename(page.id, page.name)}>
                            <FilePenLine className="mr-2 h-4 w-4"/>
                            Rename
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm text-destructive hover:text-destructive rounded-sm relative flex cursor-default select-none items-center gap-2 outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                   <Trash2 className="mr-2 h-4 w-4"/> Delete
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
                                <AlertDialogAction onClick={() => handleDeletePage(page.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleAddPage}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
  );
}
