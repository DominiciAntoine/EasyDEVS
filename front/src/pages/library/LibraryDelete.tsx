import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { client, useMutate } from "@/api/client";

export default function LibraryDelete() {
  const { id: libraryId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const mutate = useMutate();

  const isInvalidId = !libraryId || libraryId.trim() === "";

  const handleDelete = async () => {
    if (isInvalidId) {
      toast({
        title: "Invalid library ID",
        description: "No valid library ID was provided.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this library?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const response = await client.DELETE("/library/{id}", {
        params: { path: { id: libraryId } },
      });

      if (response.error) {
        throw new Error("Deletion failed");
      }

      toast({
        title: "Library deleted successfully!",
      });

      await mutate(["/library", undefined], undefined, { revalidate: true });

    } catch (error) {
      toast({
        title: "Error deleting library",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10 flex-col items-center space-y-4">
      {isInvalidId && (
        <p className="text-red-500 font-semibold">Invalid or missing library ID.</p>
      )}
      <Button
        variant="destructive"
        disabled={loading || isInvalidId}
        onClick={handleDelete}
      >
        {loading ? "Deleting..." : "Delete Library"}
      </Button>
    </div>
  );
}
