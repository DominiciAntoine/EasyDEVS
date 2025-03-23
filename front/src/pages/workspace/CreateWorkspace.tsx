import NavHeader from "@/components/nav/nav-header";
import WorkspaceForm from "@/components/workspace/workspaceForm";



export function CreateWorkspace(

){
  return(
<div className="flex flex-col h-screen w-full">
<NavHeader
      breadcrumbs={[
        { label: "Workspaces", href: "/workspace" },
        { label: "New Workspace" },
      ]}
      showNavActions={false}
      showModeToggle={true}
    >
        </NavHeader>
    <WorkspaceForm />
    </div>
  )
}
