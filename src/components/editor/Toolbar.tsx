'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEditor } from '@/context/EditorContext';
import type { ButtonElement, ContainerElement, ImageElement, Project, TextElement, VideoElement, AnimationElement, LoginFormElement } from '@/lib/types';
import { Type, Square, Video, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Expand, RotateCcw, Eye, Github, HardHat, Share2, Code, Cloud, RectangleVertical, FileText, Table, Sparkles, Zap, PartyPopper, FerrisWheel, Smile, LogIn } from 'lucide-react';
import { pageTemplates } from '@/lib/templates';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { saveProjectToDb } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { generateHtmlForProject } from '@/lib/html-builder';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import PreviewDialog from './PreviewDialog';
import { uploadImage } from '@/ai/flows/upload-image-flow';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { stickers } from '@/lib/stickers';

export default function Toolbar() {
  const { state, dispatch } = useEditor();
  const isElementSelected = !!state.selectedElementId;
  const currentPage = state.project.pages[state.currentPageIndex];
  const selectedElement = isElementSelected && currentPage?.elements ? currentPage.elements.find(el => el.id === state.selectedElementId) : undefined;
  const [showDigitalMenu, setShowDigitalMenu] = useState(false);

  const [isShareDialogOpen, setShareIsDialogOpen] = useState(false);
  const [isQuickBuilderOpen, setQuickBuilderOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [quickBuilderCode, setQuickBuilderCode] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleShare = async () => {
    if (projectId.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid ID', description: 'Project ID must be 6 digits.' });
      return;
    }
    setIsSaving(true);
    try {
      await saveProjectToDb(projectId, state.project);
      toast({ title: 'Project Shared!', description: `Your project is saved under ID: ${projectId}` });
      setShareIsDialogOpen(false);
    } catch (e) {
      const error = e as Error;
      toast({ variant: 'destructive', title: 'Share Failed', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const addImageElement = (src: string, size = { width: 300, height: 200 }) => {
     if (src) {
        const element: ImageElement = {
          id: crypto.randomUUID(),
          position: { x: 50, y: 50 },
          rotation: 0,
          animation: '',
          type: 'image',
          name: 'Image',
          src: src,
          size: size,
        };
        dispatch({ type: 'ADD_ELEMENT', payload: { element } });
      }
  }
  
  const addVideoElement = (src: string) => {
     if (src) {
        const element: VideoElement = {
          id: crypto.randomUUID(),
          position: { x: 50, y: 50 },
          rotation: 0,
          animation: '',
          type: 'video',
          name: 'Video',
          src: src,
          size: { width: 300, height: 200 },
          loop: false,
        };
        dispatch({ type: 'ADD_ELEMENT', payload: { element } });
      }
  }

  const addElement = (type: 'text' | 'button' | 'container' | 'login-form') => {
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
    } else if (type === 'container') {
      const element: ContainerElement = {
        ...commonProps,
        type: 'container',
        name: 'Container',
        backgroundColor: 'transparent',
        size: { width: 300, height: 200 },
      };
       dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    } else if (type === 'login-form') {
      const element: LoginFormElement = {
        ...commonProps,
        type: 'login-form',
        name: 'Login Form',
        size: { width: 350, height: 420 },
        // Content
        titleText: 'Login',
        usernameLabel: 'Username',
        passwordLabel: 'Password',
        buttonText: 'Submit',
        // Logic
        correctUsername: 'user',
        correctPassword: '123',
        successMessage: 'Login successful!',
        failureMessage: 'Wrong credentials.',
        // Styling
        formBackgroundColor: '#ffffff',
        formBorderColor: '#e5e7eb',
        titleColor: '#000000',
        titleFontSize: 24,
        titleFontWeight: 'bold',
        labelColor: '#374151',
        labelFontSize: 14,
      };
      dispatch({ type: 'ADD_ELEMENT', payload: { element } });
    }
  };

  const addAnimationElement = (animationType: 'fireworks' | 'confetti' | 'sparks') => {
    const element: AnimationElement = {
      id: crypto.randomUUID(),
      position: { x: 200, y: 200 },
      size: { width: 100, height: 100 }, // Placeholder size for the editor
      rotation: 0,
      animation: '',
      type: 'animation',
      name: `${animationType.charAt(0).toUpperCase() + animationType.slice(1)}`,
      animationType: animationType,
    };
    dispatch({ type: 'ADD_ELEMENT', payload: { element } });
  };
  
  const handleAddImageFromUrl = () => {
    if (imageUrl) {
        addImageElement(imageUrl);
        setImageUrl('');
        setIsMediaDialogOpen(false);
    } else {
        toast({variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid image URL.'})
    }
  }
  
  const handleAddVideoFromUrl = () => {
    if (videoUrl) {
        addVideoElement(videoUrl);
        setVideoUrl('');
        setIsMediaDialogOpen(false);
    } else {
        toast({variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid video URL.'})
    }
  }
  
  const handleAddFromDevice = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({ variant: 'destructive', title: 'File too large', description: 'Please upload a file smaller than 1MB.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        toast({ title: 'Uploading file...', description: 'Please wait a moment.' });
        try {
            const result = await uploadImage({ imageDataUrl: dataUrl, contentType: file.type });
            if (result.imageUrl) {
                if(file.type.startsWith('image/')) {
                    addImageElement(result.imageUrl);
                } else if (file.type.startsWith('video/')) {
                    addVideoElement(result.imageUrl);
                }
                toast({ title: 'File uploaded!', description: 'Your file has been added to the canvas.' });
                setIsMediaDialogOpen(false);
            } else {
                throw new Error("Upload failed to return a URL.");
            }
        } catch (error) {
            console.error('File upload failed:', error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the file.' });
        }
    };
    reader.readAsDataURL(file);
    // Reset file input
    event.target.value = '';
  }


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
  
  const handlePreview = () => {
    localStorage.setItem('ura-preview-project', JSON.stringify(state.project));
    setIsPreviewOpen(true);
  };

  const handleBuild = () => {
    localStorage.setItem('ura-preview-project', JSON.stringify(state.project));
    window.location.href = '/build';
  };

  const handleQuickBuild = () => {
    const html = generateHtmlForProject(state.project);
    setQuickBuilderCode(html);
    setQuickBuilderOpen(true);
  };
  
  const handleQuickDownload = () => {
    if (!quickBuilderCode) {
      toast({
        variant: 'destructive',
        title: 'No Code to Download',
        description: 'Code has not been generated yet.',
      });
      return;
    }
    const project: Project = state.project;
    const blob = new Blob([quickBuilderCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s/g, '-') || 'create-x-project'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <aside className="w-14 border-r bg-card flex flex-col items-center gap-0.5 py-2 z-10">
      <TooltipProvider>
        <div className="flex flex-col items-center gap-0.5 w-full px-1">
          <Tooltip>
            <TooltipTrigger asChild>
                <Button variant={isElementSelected ? "secondary" : "ghost"} size="icon" className="h-7 w-7" disabled={!isElementSelected}>
                    <Move />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right"><p>Move Tool</p></TooltipContent>
          </Tooltip>

          {isElementSelected && (
            <div className='flex flex-col gap-1 items-center p-1 border-t mt-1 w-full'>
                <Button variant="outline" size="icon" className='h-5 w-5' onClick={() => handleMove('up')}><ArrowUp className='h-3 w-3'/></Button>
                <div className='flex gap-1'>
                    <Button variant="outline" size="icon" className='h-5 w-5' onClick={() => handleMove('left')}><ArrowLeft className='h-3 w-3'/></Button>
                    <Button variant="outline" size="icon" className='h-5 w-5' onClick={() => handleMove('down')}><ArrowDown className='h-3 w-3'/></Button>
                </div>
                <Button variant="outline" size="icon" className='h-5 w-5' onClick={() => handleMove('right')}><ArrowRight className='h-3 w-3'/></Button>
                
                <div className="mt-1 space-y-0.5 text-center">
                    <Label htmlFor="move-speed" className="text-xs">Speed</Label>
                    <Input 
                        id="move-speed"
                        type="number"
                        value={state.moveIncrement}
                        onChange={(e) => dispatch({ type: 'SET_MOVE_INCREMENT', payload: { increment: Number(e.target.value) }})}
                        className="w-10 h-5 text-center text-xs"
                        min="1"
                    />
                </div>
            </div>
          )}
        </div>

        <div className="w-10 my-0.5 border-t border-border" />
        
        <div className="flex flex-col items-center gap-0.5 w-full px-1">
            <Tooltip>
                <TooltipTrigger asChild><Button variant={isElementSelected ? "secondary" : "ghost"} size="icon" className="h-7 w-7" disabled={!isElementSelected}><Expand/></Button></TooltipTrigger>
                <TooltipContent side="right"><p>Size Tool</p></TooltipContent>
            </Tooltip>
            {isElementSelected && (
                 <div className='flex flex-col gap-1 items-center p-1 border-t mt-1 w-full'>
                    <Button variant="outline" className='h-5 w-full text-[10px] px-1' onClick={() => handleResize(2)}>2x</Button>
                    <Button variant="outline" className='h-5 w-full text-[10px] px-1' onClick={() => handleResize(0.5)}>0.5x</Button>
                    <Button variant="outline" className='h-5 w-full text-[10px] px-1' onClick={() => handleResize(1)}>Reset</Button>
                 </div>
            )}
        </div>

         <div className="w-10 my-0.5 border-t border-border" />

        <div className="flex flex-col items-center gap-0.5 w-full px-1">
            <Tooltip>
                <TooltipTrigger asChild><Button variant="secondary" size="icon" className="h-7 w-7"><ZoomIn/></Button></TooltipTrigger>
                <TooltipContent side="right"><p>Zoom Tool</p></TooltipContent>
            </Tooltip>
             <div className='flex flex-col gap-1 items-center p-1 border-t mt-1 w-full'>
                <Button variant="outline" size="icon" className='h-5 w-5' onClick={() => handleZoom('in')}><ZoomIn className='h-3 w-3'/></Button>
                <Button variant="outline" size="icon" className='h-5 w-5' onClick={() => handleZoom('out')}><ZoomOut className='h-3 w-3'/></Button>
                 <Button variant="outline" size="icon" className='h-5 w-5' onClick={() => handleZoom('reset')}><RotateCcw className='h-3 w-3'/></Button>
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
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addElement('text')}>
              <Type />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Text</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addElement('button')}>
              <Square />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Button</p></TooltipContent>
        </Tooltip>
         <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addElement('login-form')}>
              <LogIn />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Login Form</p></TooltipContent>
        </Tooltip>
        
        <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
            <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMediaDialogOpen(true)}>
                    <Cloud />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right"><p>Add Media</p></TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Media</DialogTitle>
                    <DialogDescription>Upload from your device, or add from a URL.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                   <Button variant="outline" asChild className='w-full'>
                        <Label htmlFor="upload-device">
                            Upload from Device (Max 1MB)
                            <Input id="upload-device" type="file" accept="image/*,video/*" className="sr-only" onChange={handleAddFromDevice} />
                        </Label>
                    </Button>
                    <Separator />
                    <div className='space-y-2'>
                        <Label>Image from URL</Label>
                        <div className='flex gap-2'>
                            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
                            <Button onClick={handleAddImageFromUrl}>Add</Button>
                        </div>
                    </div>
                     <Separator />
                    <div className='space-y-2'>
                        <Label>Video from URL</Label>
                         <div className='flex gap-2'>
                            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://example.com/video.mp4" />
                            <Button onClick={handleAddVideoFromUrl}>Add</Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Sparkles />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Add Animation</p></TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right">
                <DropdownMenuItem onClick={() => addAnimationElement('fireworks')}>
                    <FerrisWheel className="mr-2" /> Fireworks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addAnimationElement('confetti')}>
                    <PartyPopper className="mr-2" /> Confetti
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addAnimationElement('sparks')}>
                    <Zap className="mr-2" /> Sparks
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Smile />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Add Sticker</p></TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" className="w-64">
                <ScrollArea className="h-64">
                    <div className="p-2 grid grid-cols-5 gap-1">
                        {stickers.map(sticker => (
                            <div key={sticker.name} 
                                 className="text-2xl cursor-pointer rounded-md hover:bg-accent/50 p-1"
                                 onClick={() => addImageElement(sticker.url, { width: 64, height: 64 })}
                                 title={sticker.name}
                            >
                                {sticker.emoji}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
        
         <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addElement('container')}>
              <RectangleVertical />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Container</p></TooltipContent>
        </Tooltip>

        <div className="w-10 my-0.5 border-t border-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addTemplate('template-mcq')}>
              <FileText />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add MCQ Template</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addTemplate('template-table')}>
              <Table />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Table Template</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addTemplate('template-content')}>
              <FileText />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Add Content Template</p></TooltipContent>
        </Tooltip>
      
        <div className="w-10 my-0.5 border-t border-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePreview}>
              <Eye />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Preview Project</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBuild}>
              <HardHat />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Build Project</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleQuickBuild}>
              <Code />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Quick Builder</p></TooltipContent>
        </Tooltip>
          <Dialog open={isShareDialogOpen} onOpenChange={setShareIsDialogOpen}>
          <Tooltip>
              <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShareIsDialogOpen(true)}>
                      <Share2 />
                  </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Share Project</p></TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-sm">
              <DialogHeader>
              <DialogTitle>Share Project</DialogTitle>
              <DialogDescription>Enter a 6-digit ID to save your project. Anyone with this ID can load it.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
              <Label htmlFor="share-id">Project ID</Label>
              <Input id="share-id" value={projectId} onChange={(e) => setProjectId(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g., 123456" maxLength={6} />
              </div>
              <DialogFooter>
              <Button onClick={handleShare} disabled={isSaving} size="sm">
                  {isSaving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Save & Share
              </Button>
              </DialogFooter>
          </DialogContent>
          </Dialog>
        <AlertDialog>
          <Tooltip>
              <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Github />
                      </Button>
                  </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="right"><p>GitHub</p></TooltipContent>
          </Tooltip>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Open GitHub?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will open the project's GitHub repository in a new tab. Your current work might be closed. Are you sure?
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => window.open('https://github.com/google/firebase-studio', '_blank')}>
                      Continue
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <Dialog open={isQuickBuilderOpen} onOpenChange={setQuickBuilderOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Quick Builder - HTML Code</DialogTitle>
                    <DialogDescription>This is the generated HTML for your project. You can copy it from here.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96 rounded-md border">
                    <Textarea readOnly value={quickBuilderCode} className="h-full w-full font-mono text-xs" />
                </ScrollArea>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(quickBuilderCode)}>Copy to Clipboard</Button>
                    <Button onClick={handleQuickDownload}>Download Code</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </TooltipProvider>
    </aside>
    <PreviewDialog isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
    </>
  );
}
