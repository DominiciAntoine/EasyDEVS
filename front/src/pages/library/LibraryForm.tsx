"use client"

import { useState } from 'react';
import { Input } from '../../components/ui/input.tsx';
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/hooks/use-toast";
import { client, useMutate } from '@/api/client.ts';

const formSchema = z.object({
    title: z.string().min(3, {
        message: "The title must be at least 3 characters long.",
    }),
    description: z.string().optional(),
});

export default function LibraryForm({
    onSubmitSuccess
}: {
    onSubmitSuccess?: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    const mutate = useMutate();
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
        const response = await client.POST("/library", {
        body: {
            title: values.title,
            description: values.description,
        },
        });

        if (!response.data) {
        throw new Error("No data received from API");
        }

        toast({
        title: "Library created successfully!",
        });

        await mutate(["/library", undefined], undefined, { revalidate: true });

        onSubmitSuccess?.();
        form.reset();
    } catch (error) {
        toast({
        title: "Error creating library",
        description: (error as Error).message,
        variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
    };

    return (
        <div className='h-full w-full flex flex-col justify-center items-center'>
            <div className='text-3xl text-foreground pb-20 font-bold'>
                Create a new Library
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-4/5 space-y-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="My library title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="A short description of this library."
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Library"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
