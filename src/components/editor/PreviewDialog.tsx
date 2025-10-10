'use client';

import { useEffect, useState } from 'react';
import type { Project, Page, EditorElement, ButtonElement, VideoElement } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { generateHtmlForProject } from '@/lib/html-builder';

function PreviewElement({ element, onButtonClick }: { element: EditorElement, onButtonClick: (pageId: string) => void }) {
  const getElementStyle = (): React.CSSProperties => {
    return {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      width: element.size.width,
      height: element.size.height,
      transform: `rotate(${element.rotation || 0}deg)`,
      overflow: 'hidden'
    };
  };

  const getClipPathForShape = (shape: ButtonElement['shape']): string | undefined => {
    switch (shape) {
      case 'triangle-up': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'triangle-down': return 'polygon(0% 0%, 100% 0%, 50% 100%)';
      default: return undefined;
    }
  }

  const renderSpecificElement = () => {
    switch (element.type) {
      case 'text':
        return <p style={{
          fontSize: element.fontSize,
          color: element.color,
          fontWeight: element.fontWeight,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>{element.content}</p>;
      case 'button':
        const clipPath = getClipPathForShape(element.shape);
        let borderRadius;
        if (element.shape === 'circle') borderRadius = '50%';
        else if (element.shape === 'pill') borderRadius = '9999px';
        else borderRadius = element.borderRadius;

        return (
          <div className="w-full h-full" style={{ clipPath }}>
            <Button
              variant="default"
              size="sm"
              className="w-full h-full"
              style={{
                fontSize: element.fontSize,
                color: element.color,
                backgroundColor: element.backgroundColor,
                fontWeight: element.fontWeight,
                borderRadius: borderRadius,
                clipPath: 'none',
              }}
              onClick={() => element.linkToPageId && onButtonClick(element.linkToPageId)}
            >{element.content}</Button>
          </div>
        );
      case 'image':
        return <Image src={element.src} alt="preview image" layout="fill" objectFit="cover" />;
      case 'video':
        const videoEl = element as VideoElement;
        return <video src={videoEl.src} autoPlay loop={videoEl.loop} muted style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
      case 'container':
        return <div style={{ backgroundColor: element.backgroundColor }} className="w-full h-full"></div>
      default:
        return null;
    }
  };

  return (
    <div style={getElementStyle()} className={cn(element.animation || '')}>
      <div className="w-full h-full relative">
        {renderSpecificElement()}
      </div>
    </div>
  );
}

export default function PreviewDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const storedProject = localStorage.getItem('ura-preview-project');
      if (storedProject) {
        const parsedProject: Project = JSON.parse(storedProject);
        setProject(parsedProject);
        setGeneratedHtml(generateHtmlForProject(parsedProject));
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] h-[80vh] max-w-[1200px] p-0 flex flex-col">
        <DialogHeader className="p-2 border-b flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-sm">Project Preview</DialogTitle>
        </DialogHeader>
        <div className="w-full flex-1 bg-background">
            {project ? (
                 <iframe 
                    srcDoc={generatedHtml}
                    className="w-full h-full border-none"
                    title="Project Preview"
                 />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <p>Loading Preview...</p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
