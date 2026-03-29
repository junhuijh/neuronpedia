"use client"
declare global {
    interface Window {
        handleTurnstileSuccess: (token: string) => void
    }
}
import { useState, useEffect, Dispatch, SetStateAction } from "react"
import Script from "next/script"
import { Badge } from "@/components/shadcn/badge"
import { Input } from "@/components/shadcn/input"
import { Button } from "@/components/shadcn/button"
import { useForm } from "react-hook-form"

type Feature = {
    layer:string,
    index:string,
    activations:string[],
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
    const [step, setStep] = useState<"turnstile" | "logits" | "activations" | "done">("activations")
    const [logitsAnswer, setLogitsAnswer] = useState<string>("")
    const [activationsType, setActivationsType] = useState<"focus" | "context" | null>(null)
    const [activationsAnswer, setActivationsAnswer] = useState("")

    const CLOUDFLAREPUBLICKEY = "0x4AAAAAACxnUXZIOHnu00wa"

    useEffect(() => {
        // cloudflare turnstile
        window.handleTurnstileSuccess = (token: string) => {
            fetch("http://localhost:3010/fyp/verify_turnstile", {
                method: "POST",
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
        // fetch("http://localhost:3010/fyp/feature", {
        //     method: "GET"
        // })
        // .then(async(response) => {
        //     const data = await response.json()
        //     setFeature(data.feature)
        // })
    }, [])


    const handleFinalSubmit = async () => {
        // Generate random token
        // Save token in DB
        // Send that token to the parent
        // Parent to call API to check if token is valid
        // If token has been checked, delete that token
        window.parent.postMessage({
            verified: true,
            token: ""
        }, "*")
        setStep("done")
    }

    function TurnstileTag(){
        return (
            <div>
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
        setLogitsAnswer:Dispatch<SetStateAction<string>>
    }){
        
        const defaultValues:LogitsForm = {
            logitAnswer:"", 
            logitSkip:false
        }
        const form = useForm<LogitsForm>({
            defaultValues:defaultValues
        })
        const handleSubmit= (values:LogitsForm)=>{
            if (values.logitSkip) setLogitsAnswer("No similarity found")
            else setLogitsAnswer(values.logitAnswer)
        }

        return (
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div
                    className="flex flex-col gap-y-2"
                >
                    <div
                        className=""
                    >
                        What is the similar concept among these words?
                    </div>
                    <div
                        className="flex flex-wrap bg-slate-300 rounded-md px-2 py-2 gap-x-5"
                    >
                        {logits.map((logit)=>{
                            return(
                                <Badge
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
                    <div className="flex items-center gap-x-2">
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
    }:{
        activation:string
    }){
        const [expanded, setExpanded] = useState(false)

        return(
            <div 
                className={`
                    w-full p-2 cursor-pointer text-xs 
                    ${expanded ? "" : "overflow-x-auto whitespace-nowrap"}
                `}
                onWheel={e => {
                    e.preventDefault()
                    e.currentTarget.scrollLeft += e.deltaY
                }}
                onClick={() => setExpanded(!expanded)}
            >
                {activation}
            </div>
        )
    }

    function ActivationsTag({
        activations,
        handleFinalSubmit
    }:{
        activations:string[]
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
            <div className="flex flex-col gap-y-2 w-[400px]">
                <div>What is the similarity among these passages?</div>
                <div className="text-sm text-gray-500">instruction</div>
                <div className="flex flex-col">
                    {activations.map((activation)=>{
                        return(
                            <ActivationsText activation={activation}/>
                        )
                    })}
                </div>
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
                            className=""
                            {...form.register("activationsAnswer", {
                                validate: (val)=> val.length > 0 || "Please enter an answer or check \"No similarity\""
                            })}
                        />
                        {form.formState.errors.activationsAnswer && (
                            <div className="text-red-500 text-sm">
                                {form.formState.errors.activationsAnswer.message}
                            </div>
                        )}
                        <div className="flex items-center gap-x-2">
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
        <>
            {step==="turnstile"?
                <TurnstileTag/>
            :step==="logits"?
                <LogitsTag 
                    logits={["Washington","India","Los","West","Berlin"]} 
                    setLogitsAnswer={setLogitsAnswer} 
                />
            :step==="activations"?
                <ActivationsTag
                    activations={[
                        " scheduled reporting, modifying campaign budget in real time and more.Follow Us↵↵Timberwood Park, San Antonio, Texas↵↵Nestled in the foothills of the Texas Hill Country in San Antonio, Timberwood Park offers its residents the kind of views and peaceful calm that only nature can provide. Upon easily accessing this North-Central community from Blanco, Borgfeld, and Canyon Golf roads, its easy to see why this 2,200 acre custom home development is the ideal location. Commuting, shopping, and medical services are just around the corner with Loop 1604 just 5 short miles away, and Hwy",
                        " and warranty information are all just a click away.Savoy, Texas -- Savoy ISD has named Mr. Danny Henderson as the new Principal of Savoy Elementary. Mr. Henderson was selected from over 80 applicants and was approved unanimously by the Savoy Board of Trustees.↵↵Danny Henderson↵↵Mr. Henderson has 13 years of administrative experience in Blue Ridge and in Pottsboro. Although his duties officially begin next school year, he will be visiting with staff at a get to know you meeting soon.Pharyngeal plexus (venous)↵↵The pharyngeal plexus (venous) is a network of veins beginning in the ph",
                        " are reporting from the Rio Grande Valley, both sides of the border, based in McAllen, Texas.↵↵Upcoming stories:↵↵Finding shelter. Many"
                    ]}
                    handleFinalSubmit={handleFinalSubmit}
                />
            :step==="done"?
                <DoneTag/>
            :
                <></>
            }
        </>
    )
}