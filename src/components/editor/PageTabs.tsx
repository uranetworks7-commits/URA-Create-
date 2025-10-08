'use client';

import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

export default function PageTabs() {
  const { state, dispatch } = useEditor();
  const { project, currentPageIndex } = state;

  const handleSwitchPage = (index: number) => {
    dispatch({ type: 'SWITCH_PAGE', payload: { pageIndex: index } });
  };

  const handleAddPage = () => {
    dispatch({ type: 'ADD_PAGE' });
  };

  return (
    <div className="w-full bg-card/50 rounded-lg p-2 border">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2">
                {project.pages.map((page, index) => (
                <Button
                    key={page.id}
                    variant={currentPageIndex === index ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleSwitchPage(index)}
                    className={cn(
                    'shrink-0',
                    currentPageIndex === index && 'font-semibold'
                    )}
                >
                    {page.name}
                </Button>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleAddPage}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
  );
}
