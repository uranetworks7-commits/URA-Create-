import EditorView from "@/components/editor/EditorView";
import { EditorProvider } from "@/context/EditorContext";

export default function Home() {
  return (
    <main>
      <EditorProvider>
        <EditorView />
      </EditorProvider>
    </main>
  );
}
