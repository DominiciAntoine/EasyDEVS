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
import { DiagramDetailPage} from '@/pages/diagrams/detail';

const HomePage = () => <div>Page d'accueil</div>;
const OnlineDEVSEditor = () => <div>Contact</div>;

const Main = () => {
  const { isAuthenticated, isInitialized } = useAuth()

  if (!isInitialized) {
    return null
  }



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
        <Route path="/" element={<HomePage />} />
        <Route path="/online-devs" element={<OnlineDEVSEditor />} />
        <Route path="/devs-generator" element={<DiagramGenerator />} />
        <Route path="/model-code-editor" element={<DiagramDetailPage />} />
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
