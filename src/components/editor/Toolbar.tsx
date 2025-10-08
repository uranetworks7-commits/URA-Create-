'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEditor } from '@/context/EditorContext';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ButtonElement, ContainerElement, ImageElement, TextElement } from '@/lib/types';
import { Type, Square, Image as ImageIcon, Crop, RectangleHorizontal, FileText, Table, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Expand, Shrink, RotateCcw } from 'lucide-react';
import { pageTemplates } from '@/lib/templates';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export default function Toolbar() {
  const { state, dispatch } = useEditor();
  const isElementSelected = !!state.selectedElementId;
  const selectedElement = state.project.pages[state.currentPageIndex]?.elements.find(el => el.id === state.selectedElementId);

  const addElement = (type: 'text' | 'button' | 'image' | 'container') => {
    const commonProps = {
      id: crypto.randomUUID(),
      position: { x: 50, y: 50 },
      rotation: 0,
      animation: '',
    };
    if (type === 'text') {
      const element: TextElement = {
        ...commonProps,
        type: 'text',
        name: 'Text',
        content: 'Your Text Here',
        fontSize: 16,
        color: '#000000',
        fontWeight: 'normal',
        size: { width: 150, height: 30 },
      };
      dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    } else if (type === 'button') {
      const element: ButtonElement = {
        ...commonProps,
        type: 'button',
        name: 'Button',
        content: 'Click Me',
        fontSize: 14,
        color: '#ffffff',
        backgroundColor: '#000000',
        fontWeight: 'normal',
        borderRadius: 4,
        size: { width: 100, height: 32 },
        shape: 'rectangle'
      };
      dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    } else if (type === 'image') {
       const placeholder = PlaceHolderImages[0] || { imageUrl: 'https://picsum.photos/seed/default/400/300' };
      const element: ImageElement = {
        ...commonProps,
        type: 'image',
        name: 'Image',
        src: placeholder.imageUrl,
        size: { width: 300, height: 200 },
      };
      dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    } else if (type === 'container') {
      const element: ContainerElement = {
        ...commonProps,
        type: 'container',
        name: 'Container',
        backgroundColor: 'transparent',
        size: { width: 300, height: 200 },
      };
       dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    }
  };

  const addTemplate = (templateId: string) => {
    const template = pageTemplates.find(t => t.id === templateId);
    if (template) {
      dispatch({ type: 'ADD_ELEMENTS', payload: { elements: template.elements } });
    }
  }

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedElement) return;

    const newPosition = { ...selectedElement.position };
    const increment = state.moveIncrement;

    switch (direction) {
      case 'up':
        newPosition.y -= increment;
        break;
      case 'down':
        newPosition.y += increment;
        break;
      case 'left':
        newPosition.x -= increment;
        break;
      case 'right':
        newPosition.x += increment;
        break;
    }
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, position: newPosition } });
  }

  const handleResize = (scale: number) => {
    if (!selectedElement) return;
    dispatch({ type: 'RESIZE_ELEMENT', payload: { elementId: selectedElement.id, scale } });
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    let newZoom = state.zoom;
    if (direction === 'in') newZoom = Math.min(state.zoom + 0.1, 2);
    else if (direction === 'out') newZoom = Math.max(state.zoom - 0.1, 0.2);
    else newZoom = 1;
    dispatch({ type: 'SET_ZOOM', payload: { zoom: newZoom } });
  };

  return (
    <aside className="w-16 border-r bg-card flex flex-col items-center gap-1 py-3 z-10">
      <TooltipProvider>
        <div className="flex flex-col items-center gap-0.5 w-full px-1">
          <Tooltip>
            <TooltipTrigger asChild>
                <Button variant={isElementSelected ? "secondary" : "ghost"} size="icon" className="h-8 w-8" disabled={!isElementSelected}>
                    <Move />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right"><p>Move Tool</p></TooltipContent>
          </Tooltip>

          {isElementSelected && (
            <div className='flex flex-col gap-1.5 items-center p-1.5 border-t mt-1 w-full'>
                <Button variant="outline" size="icon" className='h-6 w-6' onClick={() => handleMove('up')}><ArrowUp className='h-3.5 w-3.5'/></Button>
                <div className='flex gap-1.5'>
                    <Button variant="outline" size="icon" className='h-6 w-6' onClick={() => handleMove('left')}><ArrowLeft className='h-3.5 w-3.5'/></Button>
                    <Button variant="outline" size="icon" className='h-6 w-6' onClick={() => handleMove('down')}><ArrowDown className='h-3.5 w-3.5'/></Button>
                </div>
                <Button variant="outline" size="icon" className='h-6 w-6' onClick={() => handleMove('right')}><ArrowRight className='h-3.5 w-3.5'/></Button>
                
                <div className="mt-1 space-y-0.5 text-center">
                    <Label htmlFor="move-speed" className="text-xs">Speed</Label>
                    <Input 
                        id="move-speed"
                        type="number"
                        value={state.moveIncrement}
                        onChange={(e) => dispatch({ type: 'SET_MOVE_INCREMENT', payload: { increment: Number(e.target.value) }})}
                        className="w-12 h-6 text-center text-xs"
                        min="1"
                    />
                </div>
            </div>
          )}
        </div>

        <div className="w-10 my-0.5 border-t border-border" />
        
        <div className="flex flex-col items-center gap-0.5 w-full px-1">
            <Tooltip>
                <TooltipTrigger asChild><Button variant={isElementSelected ? "secondary" : "ghost"} size="icon" className="h-8 w-8" disabled={!isElementSelected}><Expand/></Button></TooltipTrigger>
                <TooltipContent side="right"><p>Size Tool</p></TooltipContent>
            </Tooltip>
            {isElementSelected && (
                 <div className='flex flex-col gap-1.5 items-center p-1.5 border-t mt-1 w-full'>
                    <Button variant="outline" className='h-6 w-full text-xs px-1' onClick={() => handleResize(2)}>2x</Button>
                    <Button variant="outline" className='h-6 w-full text-xs px-1' onClick={() => handleResize(0.5)}>0.5x</Button>
                    <Button variant="outline" className='h-6 w-full text-xs px-1' onClick={() => handleResize(1)}>Reset</Button>
                 </div>
            )}
        </div>

         <div className="w-10 my-0.5 border-t border-border" />

        <div className="flex flex-col items-center gap-0.5 w-full px-1">
            <Tooltip>
                <TooltipTrigger asChild><Button variant="secondary" size="icon" className="h-8 w-8"><ZoomIn/></Button></TooltipTrigger>
                <TooltipContent side="right"><p>Zoom Tool</p></TooltipContent>
            </Tooltip>
             <div className='flex flex-col gap-1.5 items-center p-1.5 border-t mt-1 w-full'>
                <Button variant="outline" size="icon" className='h-6 w-6' onClick={() => handleZoom('in')}><ZoomIn className='h-3.5 w-3.5'/></Button>
                <Button variant="outline" size="icon" className='h-6 w-6' onClick={() => handleZoom('out')}><ZoomOut className='h-3.5 w-3.5'/></Button>
                 <Button variant="outline" size="icon" className='h-6 w-6' onClick={() => handleZoom('reset')}><RotateCcw className='h-3.5 w-3.5'/></Button>
                <div className="mt-1 space-y-0.5 text-center">
                    <Label className="text-xs">Zoom</Label>
                    <div className="w-12 h-6 text-center font-bold text-xs flex items-center justify-center">
                        {Math.round(state.zoom * 100)}%
                    </div>
                </div>
            </div>
        </div>

        <div className="w-10 my-0.5 border-t border-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addElement('text')}>
              <Type />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Text</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addElement('button')}>
              <Square />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Button</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addElement('image')}>
              <ImageIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Image</p></TooltipContent>
        </Tooltip>
         <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addElement('container')}>
              <RectangleHorizontal />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Container</p></TooltipContent>
        </Tooltip>

        <div className="w-10 my-0.5 border-t border-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addTemplate('template-mcq')}>
              <FileText />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add MCQ Template</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addTemplate('template-table')}>
              <Table />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Table Template</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addTemplate('template-content')}>
              <FileText />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Content Template</p></TooltipContent>
        </Tooltip>
        <div className="w-10 my-0.5 border-t border-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" >
                <Crop />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Crop Tool (Coming Soon)</p></TooltipContent>
        </Tooltip>

      </TooltipProvider>
    </aside>
  );
}
