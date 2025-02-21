import { fetchWithAuth } from './fetchWithAuth';
import { DiagramDataType } from './types';



export const getAllDiagrams = async (
  token: string | null | undefined
): Promise<{ id: number; name: string }[]> => {
  try {
    const url = '/data/diagrams';

    const response = await fetchWithAuth(import.meta.env.VITE_API_BASE_URL + url, token, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch diagrams: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    throw error;
  }
};


export const getDiagramById = async (
  diagramId: number,
  token: string | null | undefined
): Promise<DiagramDataType> => {
  try {
    const url = `/data/diagrams/${diagramId}`;

    const response = await fetchWithAuth(import.meta.env.VITE_API_BASE_URL + url, token, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch diagram: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching diagram:', error);
    throw error;
  }
};
