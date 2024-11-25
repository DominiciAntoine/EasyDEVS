'use client'

import { AppSidebar } from "./components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "./components/ui/sidebar"


import {
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';

import { ThemeProvider } from './components/theme-provider.tsx';

import { Toaster } from './components/ui/toaster.tsx';
import DiagramGenerator from './diagramGenerator.tsx';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Login } from './login.tsx';
import { Register } from './register.tsx';
import { MinimalLayout } from "./minimalLayout.tsx";
import { DefaultLayout } from "./defaultLayout.tsx";
import { AuthProvider } from "./auth-provider";
import { ProtectedRoute } from "./protected-route";

const HomePage = () => <div>Page d'accueil</div>;
const OnlineDEVSEditor = () => <div>Contact</div>;

const Main = () => (
  <Routes>
    {/* Pages avec le layout minimaliste */}
    <Route
      path="/login"
      element={
        <MinimalLayout>
          <Login />
        </MinimalLayout>
      }
    />

    <Route
      path="/register"
      element={
        <MinimalLayout>
          <Register />
        </MinimalLayout>
      }
    />

    {/* Pages avec le layout par défaut */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <DefaultLayout>
            <HomePage />
          </DefaultLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/devs-generator"
      element={
        <ProtectedRoute>
          <DefaultLayout>
            <DiagramGenerator />
          </DefaultLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/online-devs"
      element={
        <ProtectedRoute>
          <DefaultLayout>
            <OnlineDEVSEditor />
          </DefaultLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

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
