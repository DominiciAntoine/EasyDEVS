import DiagramForm from "@/components/diagram/diagramForm";
import NavHeader from "@/components/nav/nav-header";



export function CreateDiagram(

){
  return(
<div className="flex flex-col h-screen w-full">
<NavHeader
      breadcrumbs={[
        { label: "Workspaces", href: "/workspace" },
        { label: "Diagrams", href: "/diagrams" },
        { label: "New Diagram" },
      ]}
      showNavActions={false}
      showModeToggle={true}
    >
        </NavHeader>
    <DiagramForm />
    </div>
  )
}
