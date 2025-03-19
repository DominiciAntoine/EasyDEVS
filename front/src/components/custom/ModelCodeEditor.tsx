import Editor from '@monaco-editor/react';
import type { ComponentProps } from 'react'
import { useEffect, useRef, useState } from 'react';
import { Form, useForm } from 'react-hook-form';
//import {useDebounceCallback} from 'usehooks-ts'

type ModelCodeEditorProps = {
    code: string
    onSave: (newCode: string) => Promise<void> | void
}

type ModelCodeEditorFormValues = {
    code: string
}

export const ModelCodeEditor = ({code, onSave}: ModelCodeEditorProps) => {
    const methods = useForm<ModelCodeEditorFormValues>({
        mode: 'onChange',
        defaultValues: {
            code,
        }
    })
    const containerRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState('100vh')
    //const debounceOnChange = useDebounceCallback((newValue: string) => methods.setValue('code', newValue), 500)

    useEffect(() => {
        if (containerRef.current) {
            const {height: containerHeight} = containerRef.current.getBoundingClientRect()
            setHeight(`${containerHeight}px`)
        }
    }, [])

    const onValidate: ComponentProps<typeof Editor>['onValidate'] = (markers) => {
        if(markers.some(({severity}) => severity === 8)) {
            methods.setError('code', {message: 'Invalid code'})
        }
    }

    const onSubmit: ComponentProps<typeof Form<ModelCodeEditorFormValues>>['onSubmit'] = async ({data, event}) => {
        try {
            event?.preventDefault()
            await onSave(code)
        } catch (error) {
            console.error(error)
        }
    }


    const currentCode = methods.watch('code')

    return (
        <Form onSubmit={onSubmit} {...methods} className='grid'>
            <div ref={containerRef} className='grid'>
            <Editor height={height} defaultLanguage="javascript" defaultValue={currentCode} onChange={(newCode) => {
                debounceOnChange(newCode ?? '')
            }} onValidate={onValidate} />
            </div>
        </Form>
    )
}