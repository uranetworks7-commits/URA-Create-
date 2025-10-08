'use client';

import type { Dispatch } from 'react';
import React, { createContext, useContext, useReducer } from 'react';
import type { EditorElement, Page, Project, EditorState } from '@/lib/types';
import produce from 'immer';

type EditorAction =
  | { type: 'NEW_PROJECT'; payload: { backgroundColor: string } }
  | { type: 'LOAD_PROJECT'; payload: Project }
  | { type: 'ADD_PAGE' }
  | { type: 'SWITCH_PAGE'; payload: { pageIndex: number } }
  | { type: 'UPDATE_PAGE'; payload: Partial<Page> }
  | { type: 'ADD_ELEMENT'; payload: { element: EditorElement } }
  | { type: 'UPDATE_ELEMENT'; payload: Partial<EditorElement> & { id: string } }
  | { type: 'DELETE_ELEMENT'; payload: { elementId: string } }
  | { type: 'SELECT_ELEMENT'; payload: { elementId: string | null } }

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
  history: [],
  historyIndex: -1,
};

const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  return produce(state, draft => {
    switch (action.type) {
      case 'NEW_PROJECT': {
        const firstPage = createNewPage('Page 1', action.payload.backgroundColor);
        draft.project = { pages: [firstPage] };
        draft.currentPageIndex = 0;
        draft.selectedElementId = null;
        break;
      }
      case 'LOAD_PROJECT':
        draft.project = action.payload;
        draft.currentPageIndex = 0;
        draft.selectedElementId = null;
        break;
      case 'ADD_PAGE': {
        const newPage = createNewPage(`Page ${draft.project.pages.length + 1}`, '#ffffff');
        draft.project.pages.push(newPage);
        draft.currentPageIndex = draft.project.pages.length - 1;
        draft.selectedElementId = null;
        break;
      }
      case 'SWITCH_PAGE':
        draft.currentPageIndex = action.payload.pageIndex;
        draft.selectedElementId = null;
        break;
      case 'UPDATE_PAGE': {
        if (draft.currentPageIndex !== -1) {
          const currentPage = draft.project.pages[draft.currentPageIndex];
          Object.assign(currentPage, action.payload);
        }
        break;
      }
      case 'ADD_ELEMENT': {
        if (draft.currentPageIndex !== -1) {
          draft.project.pages[draft.currentPageIndex].elements.push(action.payload.element);
          draft.selectedElementId = action.payload.element.id;
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
          if (draft.selectedElementId === action.payload.elementId) {
            draft.selectedElementId = null;
          }
        }
        break;
      }
      case 'SELECT_ELEMENT':
        draft.selectedElementId = action.payload.elementId;
        break;
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
