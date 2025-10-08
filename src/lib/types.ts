export type ElementType = 'text' | 'button' | 'image' | 'container';

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };

export interface BaseElement {
  id: string;
  name: string;
  type: ElementType;
  position: Position;
  size: Size;
  rotation: number;
  animation: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

export type ButtonShape = 'rectangle' | 'pill' | 'circle' | 'triangle-up' | 'triangle-down';

export interface ButtonElement extends BaseElement {
  type: 'button';
  content: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  fontWeight: 'normal' | 'bold';
  borderRadius: number;
  shape?: ButtonShape;
  linkToPageId?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
}

export interface ContainerElement extends BaseElement {
    type: 'container',
    backgroundColor: string;
}

export type EditorElement = TextElement | ButtonElement | ImageElement | ContainerElement;

export interface Page {
  id:string;
  name: string;
  description?: string;
  elements: EditorElement[];
  backgroundColor: string;
  backgroundImage?: string;
  redirect?: {
    toPageId: string;
    delay: number;
  };
  isCustomHtml?: boolean;
  customHtml?: string;
}

export interface Project {
  name: string;
  pages: Page[];
}

export interface EditorState {
  project: Project;
  currentPageIndex: number;
  selectedElementId: string | null;
  showSettings: boolean;
  history: Project[];
  historyIndex: number;
  moveIncrement: number;
  zoom: number;
  initialElementSizes: { [elementId: string]: Size };
}
