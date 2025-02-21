"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useAuth from "./use-auth.tsx";
import { getDiagrams, deleteDiagram } from "./api/diagramApi.ts";
import { useNavigate } from "react-router-dom";

interface Diagram {
  id: number;
  name: string;
}

export default function Diagrams() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getDiagrams(token, setDiagrams, toast).finally(() => setLoading(false));
    }
  }, [token]);

  // 🔹 Fonction pour supprimer un diagramme
  const handleDelete = async (diagramId: number) => {
    await deleteDiagram(token, diagramId, (deletedId) => {
      setDiagrams((prevDiagrams) => prevDiagrams.filter((d) => d.id !== deletedId));
      toast({ description: "Diagram deleted successfully!" });
    }, toast);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <h1 className="text-3xl text-foreground font-bold mb-6">My Diagrams</h1>

      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-foreground">Loading diagrams...</p>
        </div>
      ) : diagrams.length === 0 ? (
        <p className="text-lg text-muted-foreground">
          No diagrams found. Start by creating one!
        </p>
      ) : (
        <div className="w-3/4">
          <ul className="space-y-4">
            {diagrams.map((diagram) => (
              <li
                key={diagram.id}
                className="flex justify-between items-center bg-background p-4 rounded-lg border"
              >
                <span className="text-lg font-medium">{diagram.name}</span>
                <div className="flex space-x-2">
                  <Button onClick={() => navigate(`/diagrams/${diagram.id}`)}>View</Button>
                  <Button variant="destructive" onClick={() => handleDelete(diagram.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        className="mt-6 px-6 py-2"
        onClick={() => navigate("/devs-generator")}
      >
        Create New Diagram
      </Button>
    </div>
  );
}
