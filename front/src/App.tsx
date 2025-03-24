"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import "@xyflow/react/dist/base.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { DefaultLayout } from "@/layouts/defaultLayout";
import { MinimalLayout } from "@/layouts/minimalLayout";
import { Login } from "@/pages/login/login";
import { Register } from "@/pages/register/register";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import { ModelCodeEditor } from "./components/custom/ModelCodeEditor";
import { CreateDiagram } from "./pages/diagram/CreateDiagram";
import { CreateLibrary } from "./pages/library/CreateLibrary";
import { CreateModel } from "./pages/model/CreateModel";
import { EditModel } from "./pages/model/EditModel";
import { CreateWorkspace } from "./pages/workspace/CreateWorkspace";

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
	const { isAuthenticated, isInitialized } = useAuth();

	if (!isInitialized) return null;

	return !isAuthenticated ? (
		<MinimalLayout>
			<Routes>
				<Route element={<Login />} path="/login" />
				<Route path="/register" element={<Register />} />
				<Route path="*" element={<Navigate to="/login" />} />
			</Routes>
		</MinimalLayout>
	) : (
		<DefaultLayout>
			<Routes>
				<Route path="/library/new" element={<CreateLibrary />} />
				<Route path="/library/:id/model/new" element={<CreateModel />} />
				<Route
					path="/library/:libraryId/model/:modelId"
					element={<EditModel />}
				/>

				<Route path="/workspace/new" element={<CreateWorkspace />} />
				<Route path="/workspace/:id/diagram/new" element={<CreateDiagram />} />

				<Route path="/" element={<HomePage />} />

				<Route path="/online-devs" element={<OnlineDEVSEditor />} />
				{/* <Route path="/test2" element={<ModelCodeEditor code="" onSave={() => {}} />} /> */}

				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</DefaultLayout>
	);
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
