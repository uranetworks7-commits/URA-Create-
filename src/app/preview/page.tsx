'use client';

import { useEffect, useState, useRef } from 'react';
import type { Project, Page, EditorElement, ButtonElement, VideoElement } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
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
        return <Image src={element.src} alt="preview image" fill objectFit="cover" />;
      case 'video':
        const videoEl = element as VideoElement;
        return <video src={videoEl.src} autoPlay loop={videoEl.loop} muted controls style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
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

export default function PreviewPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const storedProject = localStorage.getItem('ura-preview-project');
    if (storedProject) {
      const parsedProject: Project = JSON.parse(storedProject);
      setProject(parsedProject);
      if (parsedProject.pages.length > 0) {
        setCurrentPage(parsedProject.pages[0]);
      }
    }

    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (project) {
        setGeneratedHtml(generateHtmlForProject(project));
    }
  }, [project]);

  useEffect(() => {
    if (currentPage?.redirect?.toPageId && currentPage.redirect.delay > 0) {
      const timer = setTimeout(() => {
        handleNavigate(currentPage.redirect!.toPageId);
      }, currentPage.redirect.delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentPage]);
  
  useEffect(() => {
    if (audioRef.current) {
        if (currentPage?.audioUrl) {
            if (audioRef.current.src !== currentPage.audioUrl) {
                audioRef.current.src = currentPage.audioUrl;
            }
            audioRef.current.loop = currentPage.audioLoop ?? true;
            if (hasInteracted) {
                 audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        } else {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    }
  }, [currentPage, hasInteracted]);


  const handleNavigate = (pageId: string) => {
    const targetPage = project?.pages.find(p => p.id === pageId);
    if (targetPage) {
      setCurrentPage(targetPage);
    } else {
      console.warn(`Preview: Page with id ${pageId} not found.`);
    }
  }

  if (!project || !currentPage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p>Loading Preview...</p>
      </div>
    );
  }

  // Handle custom HTML or build-from-HTML pages by rendering the full project in an iframe
  if (currentPage.isCustomHtml || currentPage.isBuildFromHtml) {
    return (
      <main className="h-screen w-screen overflow-auto">
        <iframe
            srcDoc={generatedHtml}
            className="w-full h-full border-none"
            title="Project Preview"
            // Set the initial visible page via a URL fragment
            onLoad={(e) => {
                const iframe = e.currentTarget;
                if (iframe.contentWindow) {
                    iframe.contentWindow.location.hash = currentPage.id;
                    // The script inside the iframe should handle showing the correct page
                }
            }}
        />
      </main>
    );
  }

  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: currentPage.backgroundColor,
  };

  if (currentPage.backgroundImage) {
    canvasStyle.backgroundImage = `url(${currentPage.backgroundImage})`;
    canvasStyle.backgroundSize = 'cover';
    canvasStyle.backgroundPosition = 'center';
  }

  return (
    <main className="h-screen w-screen overflow-auto">
      <div style={canvasStyle}>
        {currentPage.elements.map(element => (
          <PreviewElement key={element.id} element={element} onButtonClick={handleNavigate} />
        ))}
      </div>
       <audio ref={audioRef} />
    </main>
  );
}

    