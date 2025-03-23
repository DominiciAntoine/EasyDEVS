import ModelForm from "@/components/model/model/modelForm";
import NavHeader from "@/components/nav/nav-header";



export function CreateModel(

){

  return(
<div className="flex flex-col h-screen w-full">
<NavHeader
      breadcrumbs={[
        { label: "Libraries", href: "/library" },
        { label: "putlibraryname", href: "#putlibrarypath" },
        { label: "New Model" },
      ]}
      showNavActions={false}
      showModeToggle={true}
    >
        </NavHeader>
    <ModelForm />
    </div>
  )
}
