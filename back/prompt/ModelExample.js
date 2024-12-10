const modelExample = `
import { SidebarTrigger } from './components/ui/sidebar.tsx';
import { Separator } from './components/ui/separator.tsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from './components/ui/breadcrumb.tsx';
import { NavActions } from './components/nav-actions.tsx';
import { ModeToggle } from './components/mode-toggle.tsx';
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from '@codemirror/lang-javascript';
import ModelPrompt from './modelPrompt.tsx';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { ModelData, DiagramDataType } from './types'
import { useTheme } from "./components/theme-provider"; // Assure-toi que ce hook existe

function test()
{
    console.log("hello world");
    return true;
}
`

module.exports = { modelExample }