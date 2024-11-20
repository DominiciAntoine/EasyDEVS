'use client'

import { useState } from 'react'

export default function MultiStepModal({
  onGenerate,
}: {
  onGenerate: (diagramData: { nodes: any[]; edges: any[] }) => void;
}) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [diagramName, setDiagramName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleGenerateDiagram = async () => {
    setLoading(true);
    let token = '';

    try {
      const authResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' }),
      });
      const authData = await authResponse.json();

      if (authResponse.ok) {
        token = authData.token;
        setResponse(authData.message || 'Successfully got API token');
      } else {
        setResponse(authData.error || 'An error occurred while getting API token');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error(error);
      setResponse('Failed to reach the API during token access.');
      setLoading(false);
      return;
    }

    try {
      const diagramResponse = await fetch('http://localhost:3000/api/ai/generate-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ diagramName, userPrompt: prompt }),
      });
      const diagramData = await diagramResponse.json();

      if (diagramResponse.ok) {
        setResponse(diagramData.message || 'Diagram generated successfully!');
        // Transmettre les données au parent via le callback
        onGenerate({ nodes: diagramData.nodes, edges: diagramData.edges });
      } else {
        setResponse(diagramData.error || 'An error occurred while generating the diagram.');
      }
    } catch (error) {
      console.error(error);
      setResponse('Failed to reach the API during diagram generation.');
    } finally {
      setLoading(false);
      setStep(3);
    }
  };
  

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-700">Generating your diagram...</p>
        </div>
      )
    }

    switch (step) {
      case 1:
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(2)
            }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-900">Step 1: Diagram Name</h3>
            <div>
              <label htmlFor="diagram-name" className="block p-2 text-lg font-medium text-gray-700">
                Diagram Name
              </label>
              <input
                id="diagram-name"
                type="text"
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                className="mt-2 p-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg"
                placeholder="Enter diagram name..."
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                Next
              </button>
            </div>
          </form>
        )
      case 2:
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleGenerateDiagram()
            }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-900">Step 2: Define Your Diagram</h3>
            <div>
              <label htmlFor="prompt" className="block p-2 text-lg font-medium text-gray-700">
                Define Diagram
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 p-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg"
                rows={4}
                placeholder="Describe your diagram..."
                required
              />
            </div>
            <div className="flex justify-between space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
                
              >

                Generate
              </button>
            </div>
          </form>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">Result</h3>
            <p className="text-lg text-gray-700">{response}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setStep(1)
                  setDiagramName('')
                  setPrompt('')
                  setResponse('')
                }}
                className="px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`fixed inset-0 z-10 ${open ? 'flex' : 'hidden'} items-center justify-center bg-gray-500/75 backdrop-blur-md p-6`}
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl p-8">
        {renderContent()}
      </div>
    </div>
  );
}