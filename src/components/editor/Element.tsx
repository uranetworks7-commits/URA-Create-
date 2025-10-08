'use client';

import { useEditor } from '@/context/EditorContext';
import type { ButtonElement, ContainerElement, EditorElement, ImageElement, TextElement } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ElementProps {
  element: EditorElement;
}

export default function Element({ element }: ElementProps) {
  const { state, dispatch } = useEditor();
  const isSelected = state.selectedElementId === element.id;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<'br' | 'tl' | 'tr' | 'bl' | null>(null);
  const [imageError, setImageError] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (element.type === 'image') {
      setImageError(false);
    }
  }, [element.type, (element as ImageElement).src]);


  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      dispatch({ type: 'SELECT_ELEMENT', payload: { elementId: element.id } });
    }
  };
  
  const handleDragStart = (e: React.MouseEvent) => {
    if (!isSelected) return;
    e.stopPropagation();
    // prevent default to avoid text selection etc.
    e.preventDefault();
    setIsDragging(true);
  };

  const handleResizeStart = (e: React.MouseEvent, corner: 'br' | 'tl' | 'tr' | 'bl') => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeCorner(corner);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            id: element.id,
            position: {
              x: element.position.x + e.movementX / state.zoom,
              y: element.position.y + e.movementY / state.zoom,
            },
          },
        });
      }
      if (isResizing) {
        let newWidth = element.size.width;
        let newHeight = element.size.height;
        let newX = element.position.x;
        let newY = element.position.y;
        
        const minSize = 20;
        const movementX = e.movementX / state.zoom;
        const movementY = e.movementY / state.zoom;


        if (resizeCorner === 'br') {
          newWidth = Math.max(minSize, element.size.width + movementX);
          newHeight = Math.max(minSize, element.size.height + movementY);
        } else if (resizeCorner === 'tl') {
          newWidth = Math.max(minSize, element.size.width - movementX);
          newHeight = Math.max(minSize, element.size.height - movementY);
          newX = element.position.x + movementX;
          newY = element.position.y + movementY;
        } else if (resizeCorner === 'tr') {
          newWidth = Math.max(minSize, element.size.width + movementX);
          newHeight = Math.max(minSize, element.size.height - movementY);
          newY = element.position.y + movementY;
        } else if (resizeCorner === 'bl') {
           newWidth = Math.max(minSize, element.size.width - movementX);
          newHeight = Math.max(minSize, element.size.height + movementY);
          newX = element.position.x + movementX;
        }

        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            id: element.id,
            position: { x: newX, y: newY },
            size: { width: newWidth, height: newHeight },
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeCorner(null);
    };

    if (isDragging || isResizing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeCorner, dispatch, element.id, element.position, element.size, state.zoom]);

  const getClipPathForShape = (shape: ButtonElement['shape'], size: { width: number, height: number }): string | undefined => {
    switch (shape) {
      case 'triangle-up':
        return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'triangle-down':
        return 'polygon(0% 0%, 100% 0%, 50% 100%)';
      case 'circle':
        // clip-path for circle is not needed as borderRadius will handle it
        return undefined;
      default:
        return undefined;
    }
  }

  const renderSpecificElement = () => {
    const el = element;
    switch (el.type) {
      case 'text':
        return <p style={{
          fontSize: el.fontSize,
          color: el.color,
          fontWeight: el.fontWeight,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>{(el as TextElement).content}</p>;
      case 'button':
        const buttonEl = el as ButtonElement;
        const clipPath = getClipPathForShape(buttonEl.shape, buttonEl.size);

        let borderRadius;
        if (buttonEl.shape === 'circle') {
          borderRadius = '50%';
        } else if (buttonEl.shape === 'pill') {
          borderRadius = '9999px';
        } else {
          borderRadius = buttonEl.borderRadius;
        }

        return (
          <div className="w-full h-full" style={{ clipPath }}>
            <Button variant="default" size="sm" className="w-full h-full pointer-events-none" style={{
              fontSize: buttonEl.fontSize,
              color: buttonEl.color,
              backgroundColor: buttonEl.backgroundColor,
              fontWeight: buttonEl.fontWeight,
              borderRadius: borderRadius,
              // We reset clip-path on the inner button to avoid double clipping
              clipPath: 'none',
            }}>{buttonEl.content}</Button>
          </div>
        );
      case 'image':
        const imageSrc = (el as ImageElement).src;
        if (imageError || !imageSrc) {
            return (
                <div className="w-full h-full bg-destructive/20 flex flex-col items-center justify-center gap-2 text-destructive">
                    <AlertTriangle className="h-8 w-8" />
                    <p className="text-xs font-semibold text-center">Invalid Image URL</p>
                </div>
            )
        }
        return <Image 
                    src={imageSrc} 
                    alt="canvas image" 
                    layout="fill" 
                    objectFit="cover" 
                    className="pointer-events-none" 
                    onError={() => setImageError(true)}
                />;
      case 'container':
        return <div style={{backgroundColor: (el as ContainerElement).backgroundColor}} className="w-full h-full"></div>
      default:
        return null;
    }
  };
  
  const getElementStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      width: element.size.width,
      height: element.size.height,
      transform: `rotate(${element.rotation || 0}deg)`,
      outline: isSelected ? '2px solid hsl(var(--accent))' : 'none',
      outlineOffset: '2px',
      cursor: isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
      transition: 'outline 0.1s ease-in-out',
    };

    if (element.type === 'button') {
      const buttonEl = element as ButtonElement;
      if (buttonEl.shape === 'circle' || buttonEl.shape === 'pill') {
        style.overflow = 'hidden';
      }
    } else {
      style.overflow = 'hidden';
    }

    return style;
  };
  
  return (
    <div
      ref={ref}
      style={getElementStyle()}
      className={cn(element.animation || '')}
      onClick={handleSelect}
      onMouseDown={handleDragStart}
    >
      <div className="w-full h-full relative pointer-events-none">
        {renderSpecificElement()}
      </div>
      {isSelected && (
        <>
          <div
            className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, 'br')}
          />
          <div
            className="absolute -top-2 -left-2 h-4 w-4 cursor-nwse-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, 'tl')}
          />
          <div
            className="absolute -top-2 -right-2 h-4 w-4 cursor-nesw-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, 'tr')}
          />
           <div
            className="absolute -bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, 'bl')}
          />
        </>
      )}
    </div>
  );
}
