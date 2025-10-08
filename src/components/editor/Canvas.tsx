'use client';

import { useEditor } from '@/context/EditorContext';
import Element from './Element';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Canvas() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex, zoom, showGrid } = state;

  const currentPage = project.pages[currentPageIndex];

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a project to start designing.
      </div>
    );
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (currentPage.isCustomHtml) return;
    // Deselect if clicking on canvas itself
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'canvas-scaler') {
      dispatch({ type: 'SELECT_ELEMENT', payload: { elementId: null } });
    }
  };

  const canvasStyle: React.CSSProperties = {
    backgroundColor: currentPage.backgroundColor,
  };

  if (currentPage.backgroundImage) {
    canvasStyle.backgroundImage = `url(${currentPage.backgroundImage})`;
    canvasStyle.backgroundSize = 'cover';
    canvasStyle.backgroundPosition = 'center';
  }

  return (
    <div
      id="canvas-container"
      className="relative h-full w-full rounded-md shadow-inner overflow-auto"
      onClick={handleCanvasClick}
    >
      <div
        id="canvas-scaler"
        className="relative origin-top-left transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom})`,
          width: `${100 / zoom}%`,
          height: `${100 / zoom}%`,
         }}
      >
        <div 
          id="canvas"
          className={cn("relative h-full w-full", showGrid && "grid-bg")}
          style={canvasStyle}
        >
          {currentPage.isCustomHtml ? (
            <div className="absolute inset-0 bg-muted/80 flex flex-col items-center justify-center gap-2">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Visual editing is disabled for this page.</p>
              <p className="text-muted-foreground text-xs">Use the Page Settings to manage custom HTML.</p>
            </div>
          ) : (
            currentPage.elements.map(element => (
              <Element key={element.id} element={element} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
