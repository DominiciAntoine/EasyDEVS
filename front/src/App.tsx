'use client'

import {
  SidebarInset,
  SidebarProvider,
} from "./components/ui/sidebar"
import {
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import DiagramGenerator from '@/pages/generate/diagramGenerator';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from '@/pages/login/login';
import { Register } from '@/pages/register/register';
import { MinimalLayout } from "@/layouts/minimalLayout";
import { DefaultLayout } from "@/layouts/defaultLayout";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import Test from "./pages/test";
import { ModelCodeEditor } from "@/components/custom/ModelCodeEditor";
import LibraryForm from "./components/library/libraryForm";
import WorkspaceForm from "./components/workspace/workspaceForm";
import ModelForm from "./components/model/model/modelForm";
import DiagramForm from "./components/diagram/diagramForm";
import { CreateDiagram } from "./pages/diagram/CreateDiagram";
import { CreateLibrary } from "./pages/library/CreateLibrary";
import { CreateWorkspace } from "./pages/workspace/CreateWorkspace";
import { CreateModel } from "./pages/model/CreateModel";
import { EditModel } from "./pages/model/EditModel";

const HomePage = () => <div>Page d'accueil</div>;
const OnlineDEVSEditor = () => <div>Contact</div>;

/*
  ============================
  Routes front pour EasyDEVS
  ============================

  Libraries :
  - Liste            : /library
  - Création         : /library/new
  - Détail (ID)      : /library/:id
  - Édition (ID)     : /library/:id/edit
  - Suppression (ID) : /library/:id/delete

  Models :
  - Liste            : /model
  - Création         : /model/new
  - Détail (ID)      : /model/:id
  - Édition (ID)     : /model/:id/edit
  - Suppression (ID) : /model/:id/delete

  Diagrams :
  - Liste            : /diagram
  - Création         : /diagram/new
  - Détail (ID)      : /diagram/:id
  - Édition (ID)     : /diagram/:id/edit
  - Suppression (ID) : /diagram/:id/delete

  <Route path="/test2" element={<ModelCodeEditor code='' onSave={() => {}} />} />
  <Route path="/devs-generator" element={<DiagramGenerator />} />
*/

const Main = () => {
  
  const { isAuthenticated, isInitialized } = useAuth()

  if(!isInitialized) return null;

  return !isAuthenticated ? (
    <MinimalLayout>
      <Routes>
        <Route element={<Login />}
          path="/login"
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </MinimalLayout>
  ) : (
    <DefaultLayout>
      <Routes>
        <Route path="/library/new" element={<CreateLibrary />} />
        <Route path="/library/:id/model/new" element={<CreateModel />} />
        <Route path="/library/:libraryId/model/:modelId" element={<EditModel />} />

        <Route path="/workspace/new" element={<CreateWorkspace />} />
        <Route path="/workspace/:id/diagram/new" element={<CreateDiagram />} />

        

        <Route path="/" element={<HomePage />} />
        
        <Route path="/online-devs" element={<OnlineDEVSEditor />} />
        
        <Route path="/test" element={<Test />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DefaultLayout>
  )
};

const App = () => (
  <Router>
    <AuthProvider>
      <ReactFlowProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <SidebarProvider>
            <SidebarInset>
              <Main />
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </ReactFlowProvider>
    </AuthProvider>
  </Router>
);

export default App;
