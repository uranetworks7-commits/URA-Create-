'use client';

import { useEditor } from '@/context/EditorContext';
import Element from './Element';

export default function Canvas() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex } = state;

  const currentPage = project.pages[currentPageIndex];

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a project to start designing.
      </div>
    );
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect if clicking on canvas itself
    if (e.target === e.currentTarget) {
      dispatch({ type: 'SELECT_ELEMENT', payload: { elementId: null } });
    }
  };

  return (
    <div
      id="canvas"
      className="relative h-full w-full rounded-md shadow-inner overflow-hidden"
      style={{ backgroundColor: currentPage.backgroundColor }}
      onClick={handleCanvasClick}
    >
      {currentPage.elements.map(element => (
        <Element key={element.id} element={element} />
      ))}
    </div>
  );
}
