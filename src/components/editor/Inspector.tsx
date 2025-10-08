'use client';

import { useEditor } from '@/context/EditorContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../ui/button';
import { Trash2, Copy, Palette, Link, Clock, Edit, Settings, FilePenLine, X } from 'lucide-react';
import type { ButtonElement, ButtonShape, ContainerElement, EditorElement, ImageElement, TextElement } from '@/lib/types';
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
import AiSuggestions from './AiSuggestions';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"


export default function Inspector() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex, selectedElementId, showSettings } = state;

  const selectedElement = currentPageIndex === -1 ? null : project.pages[currentPageIndex].elements.find(el => el.id === selectedElementId);

  const updateElement = (payload: Partial<EditorElement> & { name?: string }) => {
    if (!selectedElementId) return;
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElementId, ...payload } });
  };
  
  const duplicateElement = () => {
    if (!selectedElement) return;
    const newElement = {
      ...selectedElement,
      id: crypto.randomUUID(),
      position: { x: selectedElement.position.x + 20, y: selectedElement.position.y + 20 },
      name: `${selectedElement.name} (copy)`
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
      <ScrollArea className="h-full">
        <div className="p-2 space-y-2">
            <div className="space-y-1">
                <Label htmlFor="element-name">Element Name</Label>
                <Input id="element-name" value={el.name} onChange={e => updateElement({ name: e.target.value })}/>
            </div>
            
            {(el.type === 'text' || el.type === 'button') && (
                <div className="space-y-1">
                    <Label htmlFor="content">Text</Label>
                    <Input id="content" value={(el as TextElement | ButtonElement).content} onChange={e => updateElement({ content: e.target.value })} />
                </div>
            )}
             {(el.type === 'text' || el.type === 'button') && (
                <div className="space-y-1">
                    <Label>Font Size</Label>
                    <div className="flex items-center gap-2">
                      <Slider value={[(el as TextElement | ButtonElement).fontSize]} onValueChange={([v]) => updateElement({ fontSize: v })} min={8} max={128} step={1} />
                      <Input type="number" value={(el as TextElement | ButtonElement).fontSize} onChange={e => updateElement({ fontSize: Number(e.target.value) })} className="w-14" />
                    </div>
                </div>
            )}
            {(el.type === 'text' || el.type === 'button') && (
                 <div className="space-y-1">
                    <Label>Font Weight</Label>
                    <Select value={(el as TextElement | ButtonElement).fontWeight} onValueChange={(v: 'normal' | 'bold') => updateElement({ fontWeight: v })}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="bold">Bold</SelectItem></SelectContent>
                    </Select>
                </div>
            )}
            {(el.type === 'text' || el.type === 'button') && (
                <div className="space-y-1">
                    <Label>Color</Label>
                    <div className="flex items-center gap-2"><Input type="color" value={(el as TextElement | ButtonElement).color} onChange={e => updateElement({ color: e.target.value })} className="w-7 h-7 p-0.5"/>
                    <Input value={(el as TextElement | ButtonElement).color} onChange={e => updateElement({ color: e.target.value })} /></div>
                </div>
            )}
            {(el.type === 'button' || el.type === 'container') && (
                <div className="space-y-1">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2"><Input type="color" value={(el as ButtonElement | ContainerElement).backgroundColor} onChange={e => updateElement({ backgroundColor: e.target.value })} className="w-7 h-7 p-0.5"/>
                    <Input value={(el as ButtonElement | ContainerElement).backgroundColor} onChange={e => updateElement({ backgroundColor: e.target.value })} /></div>
                </div>
            )}
            {el.type === 'button' && (
                <>
                  <div className="space-y-1">
                    <Label>Shape</Label>
                    <Select value={(el as ButtonElement).shape || 'rectangle'} onValueChange={(v: ButtonShape) => updateElement({ shape: v })}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rectangle">Rectangle</SelectItem>
                            <SelectItem value="pill">Pill</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="triangle-up">Triangle Up</SelectItem>
                            <SelectItem value="triangle-down">Triangle Down</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                      <Label>Border Radius</Label>
                       <div className="flex items-center gap-2">
                        <Slider value={[(el as ButtonElement).borderRadius]} onValueChange={([v]) => updateElement({ borderRadius: v })} min={0} max={50} step={1} />
                        <Input type="number" value={(el as ButtonElement).borderRadius} onChange={e => updateElement({ borderRadius: Number(e.target.value) })} className="w-14" />
                       </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Link to Page</Label>
                     <Select value={(el as ButtonElement).linkToPageId || "none"} onValueChange={(v) => updateElement({ linkToPageId: v === 'none' ? undefined : v })}>
                        <SelectTrigger><SelectValue placeholder="Select a page..."/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {project.pages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                </>
            )}
            {el.type === 'image' && (
                <div className="space-y-1">
                    <Label htmlFor="src">Image Source</Label>
                    <div className="flex items-center gap-2">
                        <Input id="src" value={(el as ImageElement).src} onChange={e => updateElement({ src: e.target.value })}/>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-7 w-7"><Palette className="h-3 w-3" /></Button>
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
             <div className="space-y-1">
                <Label>Rotation</Label>
                 <div className="flex items-center gap-2">
                    <Slider value={[el.rotation]} onValueChange={([v]) => updateElement({ rotation: v })} min={0} max={360} step={1} />
                    <Input type="number" value={el.rotation} onChange={e => updateElement({ rotation: Number(e.target.value) })} className="w-14" />
                 </div>
            </div>
             <div className="space-y-1">
                <Label>Animation</Label>
                <Select value={el.animation || 'none'} onValueChange={v => updateElement({ animation: v === 'none' ? '' : v })}>
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
            <Separator />
            <AiSuggestions element={el} />
             <Separator />
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="w-full" onClick={duplicateElement}><Copy className="mr-1 h-3 w-3"/>Duplicate</Button>
                <Button variant="destructive" size="sm" className="w-full" onClick={deleteElement}><Trash2 className="mr-1 h-3 w-3"/>Delete</Button>
            </div>
        </div>
      </ScrollArea>
    );
  };
  
  return (
      <Sheet open={showSettings && !!selectedElement} onOpenChange={(open) => !open && dispatch({type: 'TOGGLE_SETTINGS'})}>
        <SheetContent className="w-60 p-0" side="right">
          {selectedElement && (
            <>
              <SheetHeader className="p-2 border-b">
                <SheetTitle className="capitalize flex items-center justify-between">
                  {selectedElement.type} Settings
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dispatch({type: 'TOGGLE_SETTINGS'})}><X className="h-3 w-3"/></Button>
                </SheetTitle>
              </SheetHeader>
              {renderElementProperties()}
            </>
          )}
        </SheetContent>
      </Sheet>
  );
}
