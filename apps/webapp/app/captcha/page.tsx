"use client"
declare global {
    interface Window {
        handleTurnstileSuccess: (token: string) => void
    }
}
import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react"
import Script from "next/script"
import { Badge } from "@/components/shadcn/badge"
import { Input } from "@/components/shadcn/input"
import { Button } from "@/components/shadcn/button"
import { useForm } from "react-hook-form"
import { FYP_SERVER } from "@/lib/env"

type Activation = {
    tokens: string[]
    maxValueTokenIndex: number
    values: number[]
}

type Feature = {
    modelId:string,
    layer:string,
    index:string,
    activations:Activation[],
    logits:string[]
}

type LogitsForm = {
    logitAnswer:string, 
    logitSkip:boolean
}

type ActivationsForm = {
    activationsType: "focus" | "context" | null
    activationsAnswer:string
    activationsSkip:boolean
}

export default function CaptchaPage() {
    const [feature, setFeature] = useState<Feature | null>(null)
    const [step, setStep] = useState<"turnstile" | "logits" | "activations" | "done">("turnstile")
    const [logitsAnswer, setLogitsAnswer] = useState<string| null>("")

    const CLOUDFLAREPUBLICKEY = "0x4AAAAAACxnUXZIOHnu00wa"
    useEffect(() => {
        // cloudflare turnstile
        window.handleTurnstileSuccess = (token: string) => {
            fetch(`${FYP_SERVER}/fyp/verify_turnstile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success){
                    setStep("logits")
                }
            })
        }
        // Fetch random feature from the database
        fetch(`${FYP_SERVER}/fyp/random_feature`, {
            method: "GET"
        })
        .then(async(response) => {
            const data = await response.json()
            console.log(data)
            setFeature(data)
        })
    }, [])


    const handleFinalSubmit = async (values: ActivationsForm) => {
        const response = await fetch(`${FYP_SERVER}/fyp/save_captcha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                modelId: feature?.modelId,
                layer: feature?.layer,
                index: feature?.index,
                logits_answer: logitsAnswer,
                activations_type: values.activationsSkip ? null : values.activationsType,
                activations_answer: values.activationsSkip ? null : values.activationsAnswer,
            })
        })
        const data = await response.json()
        window.parent.postMessage({
            verified: true,
            token: data.token
        }, "*")
        setStep("done")
    }

    function TurnstileTag(){
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Script 
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
                    async 
                />
                <div
                    className="cf-turnstile"
                    data-sitekey={CLOUDFLAREPUBLICKEY}
                    data-callback="handleTurnstileSuccess"
                />
            </div>
        )
    }

    function LogitsTag({
        logits,
        setLogitsAnswer,
    }:{
        logits:string[]
        setLogitsAnswer:Dispatch<SetStateAction<string | null>>
    }){
        
        const defaultValues:LogitsForm = {
            logitAnswer:"", 
            logitSkip:false
        }
        const form = useForm<LogitsForm>({
            defaultValues:defaultValues
        })
        const handleSubmit= (values:LogitsForm)=>{
            if (values.logitSkip) setLogitsAnswer(null)
            else setLogitsAnswer(values.logitAnswer)
            setStep("activations")
        }

        return (
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div
                    className="flex flex-col gap-y-2 text-center w-[400px] px-1 py-2"
                >
                    <div
                        className=""
                    >
                        What is the similar concept among these words?
                    </div>
                    <div
                        className="flex flex-wrap bg-slate-300 rounded-md px-2 py-2 gap-x-5 gap-y-2"
                    >
                        {logits.map((logit, index)=>{
                            return(
                                <Badge
                                    key={index}
                                    className="bg-slate-400"
                                >
                                    {logit}
                                </Badge>
                            )
                        })}
                    </div>
                    <Input
                        placeholder="e.g. location, city names, law"
                        className=""
                        disabled={form.watch("logitSkip")}
                        {...form.register("logitAnswer", {
                            validate: (val)=> form.getValues("logitSkip") || val.length > 0 || "Please enter an answer or check \"No similarity\""
                        })}
                    />
                    {form.formState.errors.logitAnswer && (
                        <div className="text-red-500 text-sm">
                            {form.formState.errors.logitAnswer.message}
                        </div>
                    )}
                    <div className="flex items-center gap-x-2 pl-1">
                        <input
                            type="checkbox"
                            {...form.register("logitSkip")}
                        />
                        <span>No similarity</span>
                    </div>
                    <Button
                        className="w-full bg-slate-400 hover:bg-slate-600"
                        type="submit"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        )
    }

    function ActivationsText({
        activation
    }: {
        activation: Activation
    }) {
        const [expanded, setExpanded] = useState(false)
        const containerRef = useRef<HTMLDivElement>(null)
        const maxVal = Math.max(activation.values[activation.maxValueTokenIndex])
        const getColor = (value: number) => {
            if (value <= 0) return "transparent"
            const intensity = value / maxVal
            return `rgba(16, 185, 129, ${intensity * 0.8})`
        }

        useEffect(() => {
            const element = containerRef.current
            if (!element) return

            // Scroll to max token when collapsed 
            if (!expanded) {
                const tokens = element.querySelectorAll("span")
                const mainToken = tokens[activation.maxValueTokenIndex]
                mainToken?.scrollIntoView({ block: "nearest", inline: "center" })
            }

            const handler = (e: WheelEvent) => {
                if (!expanded) {
                    e.preventDefault()
                    element.scrollLeft += e.deltaY
                }
            }
            element.addEventListener("wheel", handler, { passive: false })
            return () => element.removeEventListener("wheel", handler)
        }, [expanded])

        return (
            <div
                ref={containerRef}
                className={`
                    w-full border border-slate-400 rounded-md p-2 cursor-pointer text-xs flex flex-row 
                    ${expanded ? "flex-wrap" : "overflow-x-auto whitespace-nowrap"}
                `}
                style={{scrollbarWidth: 'none'}}
                onClick={() => setExpanded(!expanded)}
            >
                {activation.tokens.map((token, i) => (
                    <span
                        key={i}
                        style={{ backgroundColor: getColor(activation.values[i]) }}
                        className="rounded-sm whitespace-pre"
                    >
                        {token}
                    </span>
                ))}
            </div>
        )
    }

    function ActivationsTag({
        activations,
        handleFinalSubmit
    }:{
        activations:Activation[]
        handleFinalSubmit: (values:ActivationsForm) => void
    }){
        
        const defaultValues = {
            activationsType: null,
            activationsAnswer:"",
            activationsSkip:false
        }
        const form = useForm<ActivationsForm>({
            defaultValues:defaultValues
        })
        const [subStep, setSubStep] = useState<"type" |"answer">("type")
        const handleSubmit = (values:ActivationsForm)=>{
            handleFinalSubmit(values)
        }
        return (
            <div 
                className="flex flex-col gap-y-2 w-[400px] px-1 py-3 h-[600px] text-center overflow-y-auto" 
                style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent'
                }}
            >
                <div>What is the similarity among these passages?</div>
                {subStep==="type"?
                    <div className="text-sm text-gray-500 text-left">
                        The green highlighted word is the 'focus word'. 
                        Do these passages share a similar focus word, 
                        or do they share similar surrounding context?
                    </div>
                :
                    <div className="text-sm text-gray-500">
                        What is the similarity?
                    </div>
                }
                <div className="flex flex-col gap-y-2 ">
                    {activations.map((activation, index)=>{
                        return(
                            <ActivationsText key={index} activation={activation}/>
                        )
                    })}
                </div>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    {subStep==="type"?
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div 
                                    className="aspect-square border rounded-lg border-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-500 hover:text-white transition-all"
                                    onClick={()=>{
                                        form.setValue("activationsType","focus")
                                        setSubStep("answer")
                                    }}
                                >
                                    Focus Word
                                </div>
                                <div 
                                    className="aspect-square border rounded-lg border-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-500 hover:text-white transition-all"
                                    onClick={()=>{
                                        form.setValue("activationsType","context")
                                        setSubStep("answer")
                                    }}
                                >
                                    Context
                                </div>
                            </div>
                            <Button
                                className="w-full bg-slate-400 hover:bg-slate-600"
                                type="button"
                                onClick={()=>{
                                    form.setValue("activationsSkip", true)
                                    handleSubmit(form.getValues())
                                }}
                            >
                                No Similarity
                            </Button>
                        </>
                    :subStep==="answer"?
                        <>
                            <Input
                                placeholder="e.g. location, city names, law"
                                className="px-1"
                                disabled={form.watch("activationsSkip")}
                                {...form.register("activationsAnswer", {
                                    validate: (val)=> form.getValues("activationsSkip") || val.length > 0 || "Please enter an answer or check \"No similarity\""
                                })}
                            />
                            {form.formState.errors.activationsAnswer && (
                                <div className="text-red-500 text-sm">
                                    {form.formState.errors.activationsAnswer.message}
                                </div>
                            )}
                            <div className="flex items-center gap-x-2 pl-1">
                                <input
                                    type="checkbox"
                                    {...form.register("activationsSkip")}
                                />
                                <span>No similarity</span>
                            </div>
                            <Button
                                className="w-full bg-slate-400 hover:bg-slate-600"
                                type="submit"
                            >
                                Submit
                            </Button>
                        </>
                    :
                        <></>
                    }
                </form>
                
            </div>
        )
    }

    function DoneTag(){
        return (
            <div>
            </div>
        )
    }

    return(
        <div className="w-full h-full flex items-center justify-center">
            {feature?
                step==="turnstile"?
                    <TurnstileTag/>
                :step==="logits"?
                    <LogitsTag 
                        logits={feature?.logits} 
                        setLogitsAnswer={setLogitsAnswer} 
                    />
                :step==="activations"?
                    <ActivationsTag
                        activations={feature?.activations}
                        handleFinalSubmit={handleFinalSubmit}
                    />
                :step==="done"?
                    <DoneTag/>
                :
                    <></>
            :
                <></>
            }
            
        </div>
    )
}