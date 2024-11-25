"use client"

import React, { useState } from 'react';
import { Input } from './components/ui/input.tsx';
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button.tsx"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from './components/ui/toaster.tsx';


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
    stage
}: {
    onGenerate: (modelData: { nodes: any[]; edges: any[] }) => void;
    stage: number;
}) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast()


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            modelName: "",
            prompt: "",
        },
    })


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
                toast({
                    description: authData.message || 'Successfully got API token',
                });
            } else {
                toast({
                    description: authData.error || 'An error occurred while getting API token',
                    variant: 'destructive',
                });
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error(error);
            toast({
                description: 'Failed to reach the API during token access.',
                variant: 'destructive',
            });
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
                body: JSON.stringify({ diagramName: values.modelName, userPrompt: values.prompt }),
            });
            const diagramData = await diagramResponse.json();
    
            if (diagramResponse.ok) {
                toast({
                    description: diagramData.message || 'Diagram generated successfully!',
                });
                onGenerate({ nodes: diagramData.nodes, edges: diagramData.edges });
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
                                        <Input placeholder="SwitchModel" {...field} />
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
                        <Button type="submit">{stage===0?"Generate":"Regenerate"}</Button>
                    </form>
                </Form>
            </div>
        );
};
