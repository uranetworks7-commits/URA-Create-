'use client';

import type { Dispatch } from 'react';
import React, { createContext, useContext, useReducer } from 'react';
import { produce } from 'immer';
import type { EditorElement, Page, Project, EditorState } from '@/lib/types';

type EditorAction =
  | { type: 'NEW_PROJECT'; payload: { backgroundColor: string } }
  | { type: 'NEW_PROJECT_FROM_TEMPLATE'; payload: { template: Page } }
  | { type: 'LOAD_PROJECT'; payload: Project }
  | { type: 'ADD_PAGE' }
  | { type: 'DELETE_PAGE'; payload: { pageId: string } }
  | { type: 'SWITCH_PAGE'; payload: { pageIndex: number } }
  | { type: 'UPDATE_PAGE'; payload: Partial<Page> & { id: string } }
  | { type: 'ADD_ELEMENT'; payload: { element: EditorElement } }
  | { type: 'ADD_ELEMENTS'; payload: { elements: EditorElement[] } }
  | { type: 'UPDATE_ELEMENT'; payload: Partial<EditorElement> & { id: string } }
  | { type: 'DELETE_ELEMENT'; payload: { elementId: string } }
  | { type: 'SELECT_ELEMENT'; payload: { elementId: string | null } }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_MOVE_INCREMENT'; payload: { increment: number } }
  | { type: 'SET_ZOOM'; payload: { zoom: number } }
  | { type: 'RESIZE_ELEMENT'; payload: { elementId: string; scale: number } };

const createNewPage = (name: string, backgroundColor: string): Page => ({
  id: crypto.randomUUID(),
  name,
  backgroundColor,
  elements: [],
});

const initialState: EditorState = {
  project: {
    pages: [],
  },
  currentPageIndex: -1,
  selectedElementId: null,
  showSettings: false,
  history: [],
  historyIndex: -1,
  moveIncrement: 10,
  zoom: 1,
  initialElementSizes: {},
};

const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  return produce(state, draft => {
    switch (action.type) {
      case 'NEW_PROJECT': {
        const firstPage = createNewPage('Page 1', action.payload.backgroundColor);
        draft.project = { pages: [firstPage] };
        draft.currentPageIndex = 0;
        draft.selectedElementId = null;
        draft.showSettings = false;
        draft.initialElementSizes = {};
        break;
      }
      case 'NEW_PROJECT_FROM_TEMPLATE': {
        const newPage = {
            ...action.payload.template,
            id: crypto.randomUUID(), // ensure a unique ID for the new page
        };
        draft.project = { pages: [newPage] };
        draft.currentPageIndex = 0;
        draft.selectedElementId = null;
        draft.showSettings = false;
        draft.initialElementSizes = {};
        newPage.elements.forEach(el => {
          draft.initialElementSizes[el.id] = el.size;
        });
        break;
      }
      case 'LOAD_PROJECT':
        draft.project = action.payload;
        draft.currentPageIndex = 0;
        draft.selectedElementId = null;
        draft.showSettings = false;
        draft.initialElementSizes = {};
        action.payload.pages.forEach(p => {
            p.elements.forEach(el => {
                draft.initialElementSizes[el.id] = el.size;
            });
        });
        break;
      case 'ADD_PAGE': {
        const newPage = createNewPage(`Page ${draft.project.pages.length + 1}`, '#ffffff');
        draft.project.pages.push(newPage);
        draft.currentPageIndex = draft.project.pages.length - 1;
        draft.selectedElementId = null;
        break;
      }
       case 'DELETE_PAGE': {
        if (draft.project.pages.length <= 1) break; // Cannot delete the last page
        const newPages = draft.project.pages.filter(p => p.id !== action.payload.pageId);
        draft.project.pages = newPages;
        if (draft.currentPageIndex >= newPages.length) {
          draft.currentPageIndex = newPages.length - 1;
        }
        draft.selectedElementId = null;
        break;
      }
      case 'SWITCH_PAGE':
        draft.currentPageIndex = action.payload.pageIndex;
        draft.selectedElementId = null;
        draft.showSettings = false;
        break;
      case 'UPDATE_PAGE': {
        const pageIndex = draft.project.pages.findIndex(p => p.id === action.payload.id);
        if (pageIndex !== -1) {
          const page = draft.project.pages[pageIndex];
          Object.assign(page, action.payload);
        }
        break;
      }
      case 'ADD_ELEMENT': {
        if (draft.currentPageIndex !== -1) {
          const element = action.payload.element;
          draft.project.pages[draft.currentPageIndex].elements.push(element);
          draft.selectedElementId = element.id;
          draft.showSettings = true;
          draft.initialElementSizes[element.id] = element.size;
        }
        break;
      }
      case 'ADD_ELEMENTS': {
        if (draft.currentPageIndex !== -1) {
            const newElements = action.payload.elements.map(el => {
                const newEl = { ...el, id: crypto.randomUUID() };
                draft.initialElementSizes[newEl.id] = newEl.size;
                return newEl;
            });
            draft.project.pages[draft.currentPageIndex].elements.push(...newElements);
        }
        break;
      }
      case 'UPDATE_ELEMENT': {
        if (draft.currentPageIndex !== -1) {
          const page = draft.project.pages[draft.currentPageIndex];
          const elementIndex = page.elements.findIndex(el => el.id === action.payload.id);
          if (elementIndex !== -1) {
            Object.assign(page.elements[elementIndex], action.payload);
          }
        }
        break;
      }
      case 'DELETE_ELEMENT': {
        if (draft.currentPageIndex !== -1) {
          const page = draft.project.pages[draft.currentPageIndex];
          page.elements = page.elements.filter(el => el.id !== action.payload.elementId);
          delete draft.initialElementSizes[action.payload.elementId];
          if (draft.selectedElementId === action.payload.elementId) {
            draft.selectedElementId = null;
            draft.showSettings = false;
          }
        }
        break;
      }
      case 'SELECT_ELEMENT':
        draft.selectedElementId = action.payload.elementId;
        if (action.payload.elementId !== null) {
          draft.showSettings = true;
        } else {
          draft.showSettings = false;
        }
        break;
      case 'TOGGLE_SETTINGS':
        draft.showSettings = !draft.showSettings;
        break;
      case 'SET_MOVE_INCREMENT':
        draft.moveIncrement = action.payload.increment;
        break;
      case 'SET_ZOOM':
        draft.zoom = action.payload.zoom;
        break;
      case 'RESIZE_ELEMENT': {
        if (draft.currentPageIndex === -1) break;
        const { elementId, scale } = action.payload;
        const page = draft.project.pages[draft.currentPageIndex];
        const element = page.elements.find(el => el.id === elementId);
        
        if (element) {
          const initialSize = draft.initialElementSizes[elementId];
          if (!initialSize) { // Should not happen if ADD_ELEMENT is correct
             draft.initialElementSizes[elementId] = element.size;
          }

          if (scale === 1) { // Reset to initial size
            element.size = draft.initialElementSizes[elementId] || element.size;
          } else {
            element.size = {
              width: element.size.width * scale,
              height: element.size.height * scale,
            };
          }
        }
        break;
      }
    }
  });
};

type EditorContextType = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
};

const EditorContext = createContext<EditorContextType>({
  state: initialState,
  dispatch: () => null,
});

export const useEditor = () => {
  return useContext(EditorContext);
};

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};
