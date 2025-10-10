import type { Page } from './types';

export const pageTemplates: Page[] = [
  {
    id: 'template-mcq',
    name: 'MCQ Page',
    description: 'A multiple choice question format.',
    backgroundColor: '#F0F4F7',
    elements: [
      {
        id: 'q-text',
        type: 'text',
        name: 'Question Text',
        position: { x: 20, y: 20 },
        size: { width: 260, height: 40 },
        rotation: 0,
        content: 'What is the capital of France?',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        animation: ''
      },
      {
        id: 'btn-option-1',
        type: 'button',
        name: 'Option 1',
        position: { x: 20, y: 70 },
        size: { width: 120, height: 30 },
        rotation: 0,
        content: 'London',
        fontSize: 11,
        color: '#ffffff',
        backgroundColor: '#60a5fa',
        fontWeight: 'normal',
        borderRadius: 8,
        animation: ''
      },
      {
        id: 'btn-option-2',
        type: 'button',
        name: 'Option 2',
        position: { x: 160, y: 70 },
        size: { width: 120, height: 30 },
        rotation: 0,
        content: 'Berlin',
        fontSize: 11,
        color: '#ffffff',
        backgroundColor: '#60a5fa',
        fontWeight: 'normal',
        borderRadius: 8,
        animation: ''
      },
      {
        id: 'btn-option-3',
        type: 'button',
        name: 'Option 3',
        position: { x: 20, y: 110 },
        size: { width: 120, height: 30 },
        rotation: 0,
        content: 'Paris',
        fontSize: 11,
        color: '#ffffff',
        backgroundColor: '#60a5fa',
        fontWeight: 'normal',
        borderRadius: 8,
        animation: ''
      },
       {
        id: 'btn-option-4',
        type: 'button',
        name: 'Option 4',
        position: { x: 160, y: 110 },
        size: { width: 120, height: 30 },
        rotation: 0,
        content: 'Madrid',
        fontSize: 11,
        color: '#ffffff',
        backgroundColor: '#60a5fa',
        fontWeight: 'normal',
        borderRadius: 8,
        animation: ''
      }
    ],
  },
  {
    id: 'template-table',
    name: 'Table Page',
    description: 'A simple page with a data table.',
    backgroundColor: '#ffffff',
    elements: [
      {
        id: 'table-title',
        type: 'text',
        name: 'Table Title',
        position: { x: 15, y: 15 },
        size: { width: 250, height: 25 },
        rotation: 0,
        content: 'User Information',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        animation: ''
      },
      {
        id: 'table-container',
        type: 'container',
        name: 'Table Container',
        position: { x: 15, y: 50 },
        size: { width: 320, height: 110 },
        rotation: 0,
        backgroundColor: '#f9fafb',
        animation: ''
      },
      // Headers
      { id: 'th-1', type: 'text', name: 'Header 1', position: { x: 25, y: 60 }, size: { width: 60, height: 20 }, rotation: 0, content: 'Name', fontSize: 10, fontWeight: 'bold', color: '#111827', animation: '' },
      { id: 'th-2', type: 'text', name: 'Header 2', position: { x: 105, y: 60 }, size: { width: 120, height: 20 }, rotation: 0, content: 'Email', fontSize: 10, fontWeight: 'bold', color: '#111827', animation: '' },
      { id: 'th-3', type: 'text', name: 'Header 3', position: { x: 245, y: 60 }, size: { width: 60, height: 20 }, rotation: 0, content: 'Role', fontSize: 10, fontWeight: 'bold', color: '#111827', animation: '' },
      // Row 1
      { id: 'tr1-td1', type: 'text', name: 'R1C1', position: { x: 25, y: 90 }, size: { width: 60, height: 20 }, rotation: 0, content: 'Jane Doe', fontSize: 9, fontWeight: 'normal', color: '#374151', animation: '' },
      { id: 'tr1-td2', type: 'text', name: 'R1C2', position: { x: 105, y: 90 }, size: { width: 120, height: 20 }, rotation: 0, content: 'jane.doe@example.com', fontSize: 9, fontWeight: 'normal', color: '#374151', animation: '' },
      { id: 'tr1-td3', type: 'text', name: 'R1C3', position: { x: 245, y: 90 }, size: { width: 60, height: 20 }, rotation: 0, content: 'Admin', fontSize: 9, fontWeight: 'normal', color: '#374151', animation: '' },
      // Row 2
      { id: 'tr2-td1', type: 'text', name: 'R2C1', position: { x: 25, y: 120 }, size: { width: 60, height: 20 }, rotation: 0, content: 'John Smith', fontSize: 9, fontWeight: 'normal', color: '#374151', animation: '' },
      { id: 'tr2-td2', type: 'text', name: 'R2C2', position: { x: 105, y: 120 }, size: { width: 120, height: 20 }, rotation: 0, content: 'john.smith@example.com', fontSize: 9, fontWeight: 'normal', color: '#374151', animation: '' },
      { id: 'tr2-td3', type: 'text', name: 'R2C3', position: { x: 245, y: 120 }, size: { width: 60, height: 20 }, rotation: 0, content: 'User', fontSize: 9, fontWeight: 'normal', color: '#374151', animation: '' },
    ]
  },
  {
    id: 'template-content',
    name: 'Content Page',
    description: 'A simple template with a heading and paragraph.',
    backgroundColor: '#fefce8',
     elements: [
       {
        id: 'content-title',
        type: 'text',
        name: 'Title',
        position: { x: 20, y: 20 },
        size: { width: 300, height: 30 },
        rotation: 0,
        content: 'My Awesome Content Page',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        animation: ''
      },
       {
        id: 'content-paragraph',
        type: 'text',
        name: 'Paragraph',
        position: { x: 20, y: 60 },
        size: { width: 320, height: 100 },
        rotation: 0,
        content: 'This is a paragraph of text that you can edit. It\'s a great starting point for a blog post, an article, or just a simple page with some information. Feel free to change the text, colors, and fonts to match your style.',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#555',
        animation: ''
      }
    ]
  }
];
