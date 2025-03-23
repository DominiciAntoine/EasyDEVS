import { client } from "@/api/client";
import { Form } from "@/components/form/Form";
import { FormSubmitError } from "@/components/form/FormSubmitError";
import { Submit } from "@/components/form/Submit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
    diagramName: string;
    diagramId: string;
    disclosure?: ReactNode;
    onSubmitSuccess: () => Promise<void> | void
}

export function DiagramDeleteDialog({
  diagramName,
  diagramId,
  disclosure,
  onSubmitSuccess
}: Props) {
    const [open, setOpen] = useState(false);
  const methods = useForm({
    mode: "onChange",
  });
  const {toast} = useToast();

  const onSubmit = async () => {
    try {
        await client.DELETE("/diagram/{id}", {
            params: {
                path: {
                    id: diagramId
                }
            }
        })
        toast({
            variant: 'default',
            title: 'Diagram successfully deleted'
        })
        await onSubmitSuccess()
        setOpen(false)
        return undefined

    } catch (error) {
        if (error instanceof Error) {
            toast({
                variant: 'destructive',
                title: 'Error deleting diagram',
                description: error.message
            })

            return error.message
        }

        return 'An error occured'
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {disclosure}
      </DialogTrigger>
      <DialogContent  className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Diagram</DialogTitle>
          <DialogDescription>
            Are you sure to delete the diagram <b>{diagramName}</b>?
          </DialogDescription>
        </DialogHeader>
        <Form methods={methods} onSubmit={onSubmit}>
          <FormSubmitError />
          <DialogFooter>
            <Submit variant="destructive">Delete Diagram</Submit>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
