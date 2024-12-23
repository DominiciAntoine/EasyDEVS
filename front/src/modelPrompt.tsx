"use client"

import { useState } from 'react';
import { Input } from './components/ui/input.tsx';
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button.tsx"
import { useToast } from "@/hooks/use-toast"
import { ModelData } from './types'
import { fetchWithAuth } from './fetchWithAuth.ts';
import useAuth from './use-auth.tsx';


const formSchema = z.object({
    modelName: z.string().min(4, {
        message: "The diagram name must be at least 4 characters long.",
    }),
    prompt: z.string().min(10, {
        message: "The prompt must be at least 20 characters long.",
    }),
})




export default function ModelPrompt({
    onGenerate,
    stage, 
    model,
    previousCodes
}: {
    onGenerate: (modelName: string, modelCode : string) => void;
    stage: number;
    model : ModelData;
    previousCodes?: string[];
}) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast()
    const { token } = useAuth();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            modelName: "",
            prompt: "",
        },
    })


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);

        try {
            const diagramResponse = await fetchWithAuth('http://localhost:3000/api/ai/generate-model', token, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Important pour que le serveur sache que les données sont en JSON
                },
                body: JSON.stringify({ modelName: values.modelName, userPrompt: values.prompt, previousModelsCode: previousCodes }),
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
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='h-full w-full flex justify-center items-center' >
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg text-foreground">Generating your diagram...</p>
                </div>
            </div>

        )
    }
    else
        return (
            <div className='h-full w-full flex flex-col justify-center items-center' >
                <div className='text-3xl text-foreground pb-20 font-bold'>
                    DEVS model Generator
                </div>

                <Form {...form} >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-4/5 space-y-8">
                        <FormField
                            control={form.control}
                            name="modelName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="SwitchModel" {...field}  />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="A switch with alternate between on and off every 10s."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">{stage < 3 ? "Generate" : "Regenerate"}</Button>
                    </form>
                </Form>
            </div>
        );
};
