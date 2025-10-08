import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, update, type Database } from 'firebase/database';
import type { Project } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyC3g6LG1FNoNFgET2zMubovKNSHpoFGh74",
  authDomain: "public-chat-f6a10.firebaseapp.com",
  databaseURL: "https://public-chat-f6a10-default-rtdb.firebaseio.com",
  projectId: "public-chat-f6a10",
  storageBucket: "public-chat-f6a10.firebasestorage.app",
  messagingSenderId: "646142541152",
  appId: "1:646142541152:web:2756cad2dcd8fe9e48f205"
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const getProjectsRef = (id: string) => {
  if (!db) throw new Error("Firebase is not initialized.");
  return ref(db, `ura-projects/${id}`);
};

export type ProjectWithId = {
    id: string;
    project: Project;
}

type SaveResult = {
    status: 'success' | 'conflict';
    conflictingProject?: ProjectWithId;
}

export const saveProjectToDb = async (
    id: string, 
    projectData: Project,
    resolution?: 'replace' | 'rename' | 'autoname',
    conflictId?: string,
): Promise<SaveResult> => {
  if (!id.match(/^\d{6}$/)) {
    throw new Error("Invalid ID format. Must be a 6-digit number.");
  }
  const projectsRef = getProjectsRef(id);
  const snapshot = await get(projectsRef);
  const existingProjects: {[key: string]: Project} = snapshot.val() || {};

  // Find a project with the same name
  const conflictingEntry = Object.entries(existingProjects).find(
    ([key, p]) => p.name === projectData.name
  );
  
  if (conflictingEntry && !resolution) {
      return { status: 'conflict', conflictingProject: { id: conflictingEntry[0], project: conflictingEntry[1] } };
  }
  
  if (resolution === 'replace') {
      if (!conflictId) throw new Error("Conflict ID is required for replacement.");
      const updates: { [key: string]: Project } = {};
      updates[conflictId] = projectData;
      await update(projectsRef, updates);
      return { status: 'success' };
  }
  
  if (resolution === 'autoname') {
      let newName = projectData.name;
      let counter = 1;
      const existingNames = Object.values(existingProjects).map(p => p.name);
      while(existingNames.includes(newName)) {
          newName = `${projectData.name} (${counter})`;
          counter++;
      }
      projectData.name = newName;
  }
  
  // For 'rename', 'autoname', or no conflict, we push a new project
  const newProjectRef = push(projectsRef);
  await set(newProjectRef, projectData);
  return { status: 'success' };
};

export const loadProjectsFromDb = async (id: string): Promise<ProjectWithId[]> => {
  if (!id.match(/^\d{6}$/)) {
    throw new Error("Invalid ID format. Must be a 6-digit number.");
  }
  const projectsRef = getProjectsRef(id);
  const snapshot = await get(projectsRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    // Handle legacy format where project was not nested
    if (data.name && data.pages) {
      // It's a single legacy project
      const legacyProject = data as Project;
      const newProjectRef = push(projectsRef);
      await set(ref(db, `ura-projects/${id}`), {[newProjectRef.key!]: legacyProject}); // Overwrite with new structure
      return [{ id: newProjectRef.key!, project: legacyProject }];
    }
    // New format
    return Object.entries(data).map(([key, project]) => ({
      id: key,
      project: project as Project
    }));
  }
  return [];
};
