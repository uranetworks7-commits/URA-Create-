'use client';

import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { FilePenLine, Plus, Trash2, Palette, Clock, Link as LinkIcon, MoreHorizontal, Image as ImageIcon, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
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
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function PageManager() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex } = state;

  const currentPage = project.pages[currentPageIndex];

  if (!currentPage) return null;

  const handleSwitchPage = (index: number) => {
    dispatch({ type: 'SWITCH_PAGE', payload: { pageIndex: index } });
  };

  const handleAddPage = () => {
    dispatch({ type: 'ADD_PAGE' });
  };
  
  const handleDeletePage = (pageId: string) => {
      dispatch({type: 'DELETE_PAGE', payload: {pageId}});
  }

  const updatePage = (payload: Partial<typeof currentPage>) => {
    dispatch({ type: 'UPDATE_PAGE', payload: { id: currentPage.id, ...payload} });
  };

  return (
    <div className="w-full bg-card/50 rounded-lg p-1 border flex items-center gap-1">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-1">
                {project.pages.map((page, index) => (
                    <Button
                        key={page.id}
                        variant={currentPageIndex === index ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handleSwitchPage(index)}
                        className={cn(
                        'shrink-0 h-7 px-2 py-1 text-[10px]',
                        currentPageIndex === index && 'font-semibold'
                        )}
                    >
                        {page.name}
                    </Button>
                ))}
                <Button variant="outline" size="icon" className="h-6 w-6 shrink-0" onClick={handleAddPage}>
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5"/></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="grid gap-3">
                    <div className="space-y-1">
                        <h4 className="font-medium leading-none text-xs">Page Settings</h4>
                        <p className="text-[10px] text-muted-foreground">
                        Adjust the settings for the current page.
                        </p>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="pageName" className="flex items-center gap-1 text-xs">
                            <FilePenLine className="h-3 w-3"/> Page Name
                        </Label>
                        <Input id="pageName" value={currentPage.name} onChange={e => updatePage({ name: e.target.value })}/>
                    </div>
                    {!currentPage.isCustomHtml && (
                      <>
                        <div className="space-y-1">
                            <Label htmlFor="pageBgColor" className="flex items-center gap-1 text-xs"><Palette className="h-3 w-3" />Background Color</Label>
                            <div className="flex items-center gap-1">
                            <Input id="pageBgColor" type="color" value={currentPage.backgroundColor} onChange={e => updatePage({ backgroundColor: e.target.value })} className="w-7 h-7 p-0.5"/>
                            <Input value={currentPage.backgroundColor} onChange={e => updatePage({ backgroundColor: e.target.value })}/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="pageBgImage" className="flex items-center gap-1 text-xs"><ImageIcon className="h-3 w-3" />Background Image URL</Label>
                            <Input id="pageBgImage" value={currentPage.backgroundImage || ''} onChange={e => updatePage({ backgroundImage: e.target.value })} placeholder="https://..." />
                        </div>
                      </>
                    )}
                    <Separator/>
                    <p className="text-xs font-medium flex items-center gap-1"><LinkIcon className="h-3 w-3"/>Page Redirect</p>
                    <div className="space-y-1">
                        <Label className="text-xs">Redirect to</Label>
                        <Select value={currentPage.redirect?.toPageId || 'none'} onValueChange={(toPageId) => updatePage({ redirect: { toPageId: toPageId === 'none' ? '' : toPageId, delay: currentPage.redirect?.delay || 0 }})}>
                            <SelectTrigger><SelectValue placeholder="Select a page..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {project.pages.filter(p => p.id !== currentPage.id).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3"/>Delay (seconds)</Label>
                        <Input type="number" value={currentPage.redirect?.delay || 0} onChange={e => updatePage({ redirect: { ...currentPage.redirect, delay: Number(e.target.value), toPageId: currentPage.redirect?.toPageId || '' }})} min="0" step="0.1"/>
                    </div>
                    <Separator/>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Code className="h-3 w-3"/>
                            <Label htmlFor="custom-html-switch" className="text-xs font-medium">Custom HTML</Label>
                            <Switch id="custom-html-switch" checked={currentPage.isCustomHtml} onCheckedChange={(checked) => updatePage({ isCustomHtml: checked })} />
                        </div>
                        {currentPage.isCustomHtml && (
                            <div className="space-y-1">
                                <Label htmlFor="customHtml" className="text-xs">HTML Code</Label>
                                <Textarea 
                                    id="customHtml"
                                    value={currentPage.customHtml || ''}
                                    onChange={e => updatePage({ customHtml: e.target.value })}
                                    placeholder="<div>Your HTML here</div>"
                                    className="h-32 font-mono text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground">The visual editor will be disabled for this page.</p>
                            </div>
                        )}
                    </div>
                     <Separator/>
                     <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="w-full" disabled={project.pages.length <=1}>
                                   <Trash2 className="mr-1.5 h-3 w-3"/> Delete Page
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
