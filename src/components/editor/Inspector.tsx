'use client';

import { useEditor } from '@/context/EditorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../ui/button';
import { Trash2, Copy, Palette, Link, Clock, Edit, Settings, FilePenLine } from 'lucide-react';
import type { ButtonElement, EditorElement, ImageElement, TextElement } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Inspector() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex, selectedElementId } = state;

  const currentPage = project.pages[currentPageIndex];
  const selectedElement = currentPage?.elements.find(el => el.id === selectedElementId);

  const updateElement = (payload: Partial<EditorElement>) => {
    if (!selectedElementId) return;
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElementId, ...payload } });
  };
  
  const updatePage = (payload: Partial<typeof currentPage>) => {
    dispatch({ type: 'UPDATE_PAGE', payload });
  };
  
  const duplicateElement = () => {
    if (!selectedElement) return;
    const newElement = {
      ...selectedElement,
      id: crypto.randomUUID(),
      position: { x: selectedElement.position.x + 20, y: selectedElement.position.y + 20 },
    };
    dispatch({ type: 'ADD_ELEMENT', payload: { element: newElement } });
  }

  const deleteElement = () => {
    if (!selectedElementId) return;
    dispatch({ type: 'DELETE_ELEMENT', payload: { elementId: selectedElementId } });
  };

  const renderElementProperties = () => {
    if (!selectedElement) return null;
    const el = selectedElement;

    return (
      <>
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium capitalize">{el.type} Properties</p>
                 <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={duplicateElement}><Copy className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={deleteElement}><Trash2 className="h-4 w-4"/></Button>
                </div>
            </div>
            
            {(el.type === 'text' || el.type === 'button') && (
                <div className="space-y-2">
                    <Label htmlFor="content">Text</Label>
                    <div className="relative">
                        <Input id="content" value={(el as TextElement | ButtonElement).content} onChange={e => updateElement({ content: e.target.value })} className="pr-24"/>
                        <div className="absolute top-1/2 right-1 -translate-y-1/2 flex items-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><FilePenLine className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </div>
            )}
             {(el.type === 'text' || el.type === 'button') && (
                <div className="space-y-2">
                    <Label>Font Size</Label>
                    <div className="flex items-center gap-2">
                      <Slider value={[(el as TextElement | ButtonElement).fontSize]} onValueChange={([v]) => updateElement({ fontSize: v })} min={8} max={128} step={1} />
                      <Input type="number" value={(el as TextElement | ButtonElement).fontSize} onChange={e => updateElement({ fontSize: Number(e.target.value) })} className="w-20" />
                    </div>
                </div>
            )}
            {(el.type === 'text' || el.type === 'button') && (
                 <div className="space-y-2">
                    <Label>Font Weight</Label>
                    <Select value={(el as TextElement | ButtonElement).fontWeight} onValueChange={(v: 'normal' | 'bold') => updateElement({ fontWeight: v })}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="bold">Bold</SelectItem></SelectContent>
                    </Select>
                </div>
            )}
            {(el.type === 'text' || el.type === 'button') && (
                <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex items-center gap-2"><Input type="color" value={(el as TextElement | ButtonElement).color} onChange={e => updateElement({ color: e.target.value })} className="w-10 h-10 p-1"/>
                    <Input value={(el as TextElement | ButtonElement).color} onChange={e => updateElement({ color: e.target.value })} /></div>
                </div>
            )}
            {el.type === 'button' && (
                <>
                  <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex items-center gap-2"><Input type="color" value={(el as ButtonElement).backgroundColor} onChange={e => updateElement({ backgroundColor: e.target.value })} className="w-10 h-10 p-1"/>
                      <Input value={(el as ButtonElement).backgroundColor} onChange={e => updateElement({ backgroundColor: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2">
                      <Label>Border Radius</Label>
                      <Slider value={[(el as ButtonElement).borderRadius]} onValueChange={([v]) => updateElement({ borderRadius: v })} min={0} max={50} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Link to Page</Label>
                     <Select value={(el as ButtonElement).linkToPageId} onValueChange={(v) => updateElement({ linkToPageId: v })}>
                        <SelectTrigger><SelectValue placeholder="Select a page..."/></SelectTrigger>
                        <SelectContent>
                          {project.pages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                </>
            )}
            {el.type === 'image' && (
                <div className="space-y-2">
                    <Label htmlFor="src">Image Source</Label>
                    <div className="flex items-center gap-2">
                        <Input id="src" value={(el as any).src} onChange={e => updateElement({ src: e.target.value })}/>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon"><Palette className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {PlaceHolderImages.map(img => (
                                    <DropdownMenuItem key={img.id} onClick={() => updateElement({src: img.imageUrl})}>
                                        {img.description}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
             <div className="space-y-2">
                <Label>Rotation</Label>
                <Slider value={[el.rotation]} onValueChange={([v]) => updateElement({ rotation: v })} min={0} max={360} step={1} />
            </div>
             <div className="space-y-2">
                <Label>Animation</Label>
                <Select value={el.animation} onValueChange={v => updateElement({ animation: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Select animation..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="anim-fade-in">Fade In</SelectItem>
                        <SelectItem value="anim-slide-in-up">Slide In Up</SelectItem>
                        <SelectItem value="anim-pulse">Pulse</SelectItem>
                        <SelectItem value="anim-pop">Pop</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </>
    );
  };
  
  const renderPageProperties = () => {
    if (!currentPage) return null;
    return (
        <div className="p-4 space-y-4">
            <p className="text-sm font-medium">Page Properties</p>
             <div className="space-y-2">
                <Label htmlFor="pageName">Page Name</Label>
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
            <p className="text-sm font-medium flex items-center gap-2"><Link className="h-4 w-4"/>Page Redirect</p>
            <div className="space-y-2">
                <Label>Redirect to</Label>
                <Select value={currentPage.redirect?.toPageId} onValueChange={(toPageId) => updatePage({ redirect: { ...currentPage.redirect, toPageId, delay: currentPage.redirect?.delay || 0 }})}>
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
        </div>
    );
  }

  return (
    <aside className="w-80 border-l bg-card hidden md:flex flex-col">
        <ScrollArea className="flex-1">
            {selectedElement ? renderElementProperties() : renderPageProperties()}
        </ScrollArea>
    </aside>
  );
}

    