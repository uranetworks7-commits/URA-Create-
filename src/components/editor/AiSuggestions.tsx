'use client';

import { suggestAnimationsAndEffects } from '@/ai/flows/suggest-animations-effects';
import { Button } from '@/components/ui/button';
import { useEditor } from '@/context/EditorContext';
import type { EditorElement } from '@/lib/types';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface Suggestion {
  animationName: string;
  animationDescription: string;
  relevanceScore: number;
}

export default function AiSuggestions({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { toast } = useToast();

  const getSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);
    try {
      const page = state.project.pages[state.currentPageIndex];
      const pageDescription = `A web design canvas with a ${page.backgroundColor} background, containing ${page.elements.length} elements.`;
      
      let elementContent = '';
      if(element.type === 'text' || element.type === 'button') {
        elementContent = `The element's text content is "${element.content}".`;
      } else if (element.type === 'image') {
        elementContent = `The element is an image.`
      }

      const elementDescription = `A ${element.type} element with size ${element.size.width}x${element.size.height} pixels. ${elementContent}`;

      const result = await suggestAnimationsAndEffects({
        pageDescription,
        elementDescription,
      });

      if (result && result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Error',
        description: 'Could not fetch animation suggestions.',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyAnimation = (animationName: string) => {
    let cssClass = '';
    switch (animationName.toLowerCase()) {
      case 'fade in':
        cssClass = 'anim-fade-in';
        break;
      case 'slide in up':
        cssClass = 'anim-slide-in-up';
        break;
      case 'pulse':
        cssClass = 'anim-pulse';
        break;
      case 'pop':
        cssClass = 'anim-pop';
        break;
      default:
        // Try to create a class name from the suggestion
        cssClass = `anim-${animationName.toLowerCase().replace(/\s+/g, '-')}`;
    }

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, animation: cssClass },
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={getSuggestions} disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Suggest Animations
      </Button>
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Suggestions</h4>
          <ScrollArea className="h-48 rounded-md border p-2">
             <div className="space-y-2">
                {suggestions.map((s, i) => (
                <div
                    key={i}
                    onClick={() => applyAnimation(s.animationName)}
                    className="p-2 rounded-md hover:bg-accent/50 cursor-pointer border border-transparent hover:border-accent"
                >
                    <p className="font-semibold text-sm">{s.animationName}</p>
                    <p className="text-xs text-muted-foreground">{s.animationDescription}</p>
                </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
