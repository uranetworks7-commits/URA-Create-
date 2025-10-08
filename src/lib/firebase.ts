import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, get, type Database } from 'firebase/database';
import type { Project } from './types';
import { generateHtmlForProject } from './html-builder';

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

const getProjectRef = (id: string) => {
  if (!db) {
    throw new Error("Firebase is not initialized.");
  }
  return ref(db, `projects/${id}`);
};

export const saveProjectToDb = async (id: string, projectData: Project): Promise<void> => {
  if (!id.match(/^\d{6}$/)) {
    throw new Error("Invalid ID format. Must be a 6-digit number.");
  }
  const html = generateHtmlForProject(projectData);
  await set(getProjectRef(id), {
      name: projectData.name,
      html,
      // We also save the project data itself to allow re-loading it into the editor
      project: projectData
    });
};

export const loadProjectFromDb = async (id: string): Promise<Project | null> => {
  if (!id.match(/^\d{6}$/)) {
    throw new Error("Invalid ID format. Must be a 6-digit number.");
  }
  const snapshot = await get(getProjectRef(id));
  if (snapshot.exists()) {
    const data = snapshot.val();
    // For backwards compatibility, if project data exists, return that.
    // Otherwise, return null as we can't reconstruct the project from just HTML.
    return data.project ? (data.project as Project) : null;
  }
  return null;
};
