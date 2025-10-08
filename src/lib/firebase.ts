import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, update, remove, type Database } from 'firebase/database';
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

const getProjectPath = (id: string, projectId: string) => {
    if (!db) throw new Error("Firebase is not initialized.");
    return ref(db, `ura-projects/${id}/${projectId}`);
}

export type ProjectWithId = {
    id: string;
    project: Project;
}

export const saveProjectToDb = async (
    accessId: string, 
    projectData: Project,
    existingProjectId?: string | null,
    overwrite: boolean = false,
): Promise<ProjectWithId> => {
  if (!accessId.match(/^\d{6}$/)) {
    throw new Error("Invalid ID format. Must be a 6-digit number.");
  }
  const projectsRef = getProjectsRef(accessId);

  // If we are overwriting an existing project
  if (existingProjectId && overwrite) {
      const projectRef = getProjectPath(accessId, existingProjectId);
      await set(projectRef, projectData);
      return { id: existingProjectId, project: projectData };
  }

  // If we are saving as a new copy (or for the first time)
  const allProjects = await loadProjectsFromDb(accessId);
  const existingNames = allProjects.map(p => p.project.name);
  let newName = projectData.name;
  
  if (existingNames.includes(newName)) {
      let counter = 1;
      let tempName = `${newName} (${counter})`;
      while (existingNames.includes(tempName)) {
          counter++;
          tempName = `${newName} (${counter})`;
      }
      newName = tempName;
  }
  
  const newProjectData = { ...projectData, name: newName };
  const newProjectRef = push(projectsRef);
  await set(newProjectRef, newProjectData);
  
  if (!newProjectRef.key) {
      throw new Error("Failed to get new project key from Firebase.");
  }

  return { id: newProjectRef.key, project: newProjectData };
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
      const legacyProject = data as Project;
      const newProjectRef = push(projectsRef);
      await set(ref(db, `ura-projects/${id}`), {[newProjectRef.key!]: legacyProject}); // Overwrite with new structure
      return [{ id: newProjectRef.key!, project: legacyProject }];
    }
    // New format
    return Object.entries(data).map(([key, project]) => ({
      id: key,
      project: project as Project
    })).sort((a,b) => a.project.name.localeCompare(b.project.name)); // Sort alphabetically
  }
  return [];
};


export const deleteProjectFromDb = async (accessId: string, projectId: string): Promise<void> => {
    if (!accessId.match(/^\d{6}$/)) {
        throw new Error("Invalid Access ID format.");
    }
    if (!projectId) {
        throw new Error("Project ID is required for deletion.");
    }
    const projectRef = getProjectPath(accessId, projectId);
    await remove(projectRef);
}
