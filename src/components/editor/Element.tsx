'use client';

import { useEditor } from '@/context/EditorContext';
import type { ButtonElement, EditorElement, ImageElement, TextElement } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';

interface ElementProps {
  element: EditorElement;
}

export default function Element({ element }: ElementProps) {
  const { state, dispatch } = useEditor();
  const isSelected = state.selectedElementId === element.id;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_ELEMENT', payload: { elementId: element.id } });
  };
  
  const handleDragStart = (e: React.MouseEvent) => {
    if (!isSelected) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            id: element.id,
            position: {
              x: element.position.x + e.movementX,
              y: element.position.y + e.movementY,
            },
          },
        });
      }
      if (isResizing) {
        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            id: element.id,
            size: {
              width: Math.max(20, element.size.width + e.movementX),
              height: Math.max(20, element.size.height + e.movementY),
            },
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dispatch, element.id, element.position, element.size]);

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
        }}>{(el as TextElement).content}</p>;
      case 'button':
        const buttonEl = el as ButtonElement;
        return <Button variant="default" size="sm" className="w-full h-full pointer-events-none" style={{
          fontSize: buttonEl.fontSize,
          color: buttonEl.color,
          backgroundColor: buttonEl.backgroundColor,
          fontWeight: buttonEl.fontWeight,
          borderRadius: buttonEl.borderRadius,
        }}>{buttonEl.content}</Button>;
      case 'image':
        return <Image src={(el as ImageElement).src} alt="canvas image" layout="fill" objectFit="cover" className="pointer-events-none" />;
      default:
        return null;
    }
  };

  const animationClass = state.selectedElementId === element.id && element.animation 
      ? element.animation 
      : (element.animation && !element.animation.includes('infinite') ? element.animation : '');


  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        outline: isSelected ? '2px solid hsl(var(--accent))' : 'none',
        outlineOffset: '2px',
        cursor: isDragging ? 'grabbing' : (isSelected ? 'grab' : 'pointer'),
        transition: 'outline 0.1s ease-in-out',
      }}
      className={`rounded-sm ${element.animation || ''}`}
      onClick={handleSelect}
      onMouseDown={handleDragStart}
    >
      <div className="w-full h-full relative">
        {renderSpecificElement()}
      </div>
      {isSelected && (
        <>
          <div
            className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={handleResizeStart}
          />
          <div
            className="absolute -top-2 -left-2 h-4 w-4 cursor-nwse-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={handleResizeStart}
          />
          <div
            className="absolute -top-2 -right-2 h-4 w-4 cursor-nesw-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={handleResizeStart}
          />
           <div
            className="absolute -bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded-full bg-accent border-2 border-background shadow-lg"
            onMouseDown={handleResizeStart}
          />
        </>
      )}
    </div>
  );
}
