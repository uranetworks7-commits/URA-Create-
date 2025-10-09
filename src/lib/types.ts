export type ElementType = 'text' | 'button' | 'image' | 'container' | 'video' | 'animation' | 'login-form';

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
  loopAnimation?: boolean;
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

export interface VideoElement extends BaseElement {
  type: 'video';
  src: string;
}

export interface ContainerElement extends BaseElement {
    type: 'container',
    backgroundColor: string;
}

export interface AnimationElement extends BaseElement {
  type: 'animation';
  animationType: 'fireworks' | 'confetti' | 'sparks';
}

export interface LoginFormElement extends BaseElement {
  type: 'login-form';
  // Content
  titleText: string;
  usernameLabel: string;
  passwordLabel: string;
  buttonText: string;
  // Logic
  correctUsername: string;
  correctPassword: string;
  successMessage?: string;
  failureMessage?: string;
  successPageId?: string;
  failurePageId?: string;
  // Styling
  formBackgroundColor: string;
  formBorderColor: string;
  titleColor: string;
  titleFontSize: number;
  titleFontWeight: 'normal' | 'bold';
  labelColor: string;
  labelFontSize: number;
}


export type EditorElement = TextElement | ButtonElement | ImageElement | ContainerElement | VideoElement | AnimationElement | LoginFormElement;

export interface Page {
  id:string;
  name: string;
  description?: string;
  elements: EditorElement[];
  backgroundColor: string;
  backgroundImage?: string;
  audioUrl?: string;
  audioLoop?: boolean;
  redirect?: {
    toPageId: string;
    delay: number;
  };
  isCustomHtml?: boolean;
  customHtml?: string;
  isBuildFromHtml?: boolean;
  buildHtml?: string;
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
  showGrid: boolean;
  history: Project[];
  historyIndex: number;
  moveIncrement: number;
  zoom: number;
  initialElementSizes: { [elementId: string]: Size };
}
