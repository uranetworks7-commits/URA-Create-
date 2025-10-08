'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEditor } from '@/context/EditorContext';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ButtonElement, ImageElement, TextElement } from '@/lib/types';
import { Type, Square, Image as ImageIcon, Crop } from 'lucide-react';

export default function Toolbar() {
  const { dispatch } = useEditor();

  const addElement = (type: 'text' | 'button' | 'image') => {
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
        fontSize: 24,
        color: '#000000',
        fontWeight: 'normal',
        size: { width: 200, height: 50 },
      };
      dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    } else if (type === 'button') {
      const element: ButtonElement = {
        ...commonProps,
        type: 'button',
        name: 'Button',
        content: 'Click Me',
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: '#000000',
        fontWeight: 'normal',
        borderRadius: 8,
        size: { width: 120, height: 40 },
      };
      dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    } else if (type === 'image') {
       const placeholder = PlaceHolderImages[0] || { imageUrl: 'https://picsum.photos/seed/default/400/300' };
      const element: ImageElement = {
        ...commonProps,
        type: 'image',
        name: 'Image',
        src: placeholder.imageUrl,
        size: { width: 400, height: 300 },
      };
      dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    }
  };

  return (
    <aside className="w-16 border-r bg-card flex flex-col items-center gap-2 py-4 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => addElement('text')}>
              <Type />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Text</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => addElement('button')}>
              <Square />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Button</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => addElement('image')}>
              <ImageIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Image</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => { /* Implement crop functionality */ }}>
              <Crop />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Crop Image</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  );
}
