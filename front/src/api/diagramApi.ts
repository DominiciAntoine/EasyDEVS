import { fetchWithAuth } from '../fetchWithAuth';
import {DiagramDataType} from '../types'

export interface DiagramPayload {
    diagramName: string;
    prompt: string;
}


export const generateDiagram = async (
    token: string | null | undefined,
    payload: DiagramPayload,
    onGenerate: (diagramData: DiagramDataType) => void,
    toast: (options: { description: string; variant?: 'destructive' | 'default' }) => void
): Promise<void> => {
    try {
        const diagramResponse = await fetchWithAuth('http://localhost:3000/api/ai/generate-diagram', token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Important pour que le serveur sache que les données sont en JSON
            },
            body: JSON.stringify({ diagramName: payload.diagramName, userPrompt: payload.prompt }),
        });

        const diagramData = await diagramResponse.json();

        if (diagramResponse.ok) {
            toast({
                description: diagramData.message || 'Diagram generated successfully!',
            });
            onGenerate({
                nodes: diagramData.nodes,
                edges: diagramData.edges,
                name: payload.diagramName,
                currentModel: 0, 
                diagramId: 0, 
                models:[]
            });
        } else {
            toast({
                description: diagramData.error || 'An error occurred while generating the diagram.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            description: 'Failed to reach the API during diagram generation.',
            variant: 'destructive',
        });
    }
};

export interface ModelPayload {
    modelName: string;
    prompt: string;
    previousCodes : String[]
}

export const generateModel = async (
    token: string | null | undefined,
    payload: ModelPayload,
    onGenerate: (diagramData: DiagramDataType) => void,
    toast: (options: { description: string; variant?: 'destructive' | 'default' }) => void
): Promise<void> => {
    try {
        const diagramResponse = await fetchWithAuth('http://localhost:3000/api/ai/generate-model', token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Important pour que le serveur sache que les données sont en JSON
            },
            body: JSON.stringify({ modelName: payload.modelName, userPrompt: payload.prompt, previousModelsCode: payload.previousCodes }),
        });
        const diagramData = await diagramResponse.json();         

        if (diagramResponse.ok) {
            toast({
                description: diagramData.message || 'Diagram generated successfully!',
            });
            onGenerate( values.modelName, diagramData.modelExample);
        } else {
            toast({
                description: diagramData.error || 'An error occurred while generating the diagram.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            description: 'Failed to reach the API during diagram generation.',
            variant: 'destructive',
        });
    } finally {
        
    }
    
};