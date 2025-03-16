"use client";

import CodeMirror from "@uiw/react-codemirror";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { python } from "@codemirror/lang-python";
import { useTheme } from "@/components/theme-provider";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import ResizerNode from "@/components/custom/reactFlow/ResizerNode.tsx";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Plus,
  Minus,
  ArrowRightToLine,
  ArrowRightFromLine,
} from "lucide-react";
import { initialNodes } from "@/staticModel/initialModel.tsx";
import { examplePythonCode } from "@/staticModel/examplePythonCode.tsx";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb.tsx";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { Separator } from "@/components/ui/separator.tsx";

const nodeTypes = {
  resizer: ResizerNode,
};


export function ModelCodePlayground() {
  const { theme } = useTheme();
  // /models/:id/recursive
  // model and component
  // when update of child -> recall the get of main model recursive
  // const {data:} = request sdk
  // CODE // VIEW -> MODIFIER 


  const [modelName] = useState("Model");
  const [inputPorts, setInputPorts] = useState<string[]>([]);
  const [outputPorts, setOutputPorts] = useState<string[]>([]);
  const addInputPort = () => setInputPorts([...inputPorts, `Port ${inputPorts.length + 1}`]);
  const removeInputPort = () => setInputPorts(inputPorts.slice(0, -1));

  const addOutputPort = () => setOutputPorts([...outputPorts, `Port ${outputPorts.length + 1}`]);
  const removeOutputPort = () => setOutputPorts(outputPorts.slice(0, -1));

  return (
    <div className="h-full w-full flex flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{modelName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="ghost" size="icon" >
          <Pencil className="h-5 w-5" />
        </Button>
      </header>
      <div className="h-full w-full flex flex-col justify-center items-center p-4 space-y-4">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <CodeMirror
              value={examplePythonCode}
              className="h-full"
              theme={theme === "dark" ? githubDark : githubLight}
              extensions={[python()]}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <div className="w-full flex justify-center space-x-8">
              <div className="flex flex-col items-center space-y-2">
                <Label className="flex items-center space-x-2">
                  <ArrowRightToLine className="h-4 w-4" /> <span>Ports in</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={removeInputPort}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{inputPorts.length}</span>
                  <Button variant="ghost" size="icon" onClick={addInputPort}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Label className="flex items-center space-x-2">
                  <ArrowRightFromLine className="h-4 w-4" /> <span>Ports out</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={removeOutputPort}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{outputPorts.length}</span>
                  <Button variant="ghost" size="icon" onClick={addOutputPort}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ReactFlow nodes={initialNodes} nodeTypes={nodeTypes} fitView minZoom={0.1}>
              <Background />
            </ReactFlow>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}