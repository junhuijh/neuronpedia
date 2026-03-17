import { Button } from "@/components/shadcn/button";
import { CLTGraph, CLTGraphNode, CltVisState } from "./graph-types";
import { Plus, Minus, Zap } from 'lucide-react';
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/shadcn/dialog';
import { Input } from "@/components/shadcn/input";
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';

export default function SpeedAddButton({
    selectedGraph,
    visState,
    updateVisStateField,
    getOverrideClerpForNode
}: {
    selectedGraph: CLTGraph | null;
    visState: CltVisState;
    updateVisStateField: <K extends keyof CltVisState>(key: K, value: CltVisState[K]) => void;
    getOverrideClerpForNode: (node: CLTGraphNode) => string | undefined
}) {
    const [speedAddPopUpOpen, setSpeedAddPopUpOpen] = useState<boolean>(false)
    type SpeedAddForm = {
        queries:{value:string}[]
    }
    const form = useForm<SpeedAddForm>({
        defaultValues: {
            queries: [{ value: '' }]
        }
    })
    const { fields, append, remove } = useFieldArray<SpeedAddForm>({
        control: form.control,
        name: 'queries'
    })

    function getName(node:CLTGraphNode){
        const label = getOverrideClerpForNode(node)
        if (!label) return null
        if(node.feature_type == "logit"){
            return label.replace(/"/g, '').trim().split(' ').at(-2)!
        }else if(node.feature_type == "embedding"){
            return label.trim().replace(/"/g, '').split(/\s+/).pop() || node.clerp
        }else if(node.feature_type == "mlp reconstruction error"){
            return null
        }
        return label
    }

    async function handleSpeedAdd(formValues:SpeedAddForm){
        if(!selectedGraph) return
        const currentPinnedIds = new Set(visState.pinnedIds);
        const matchingNodesIds = selectedGraph.nodes
        .filter(node => {
            if (node.nodeId && currentPinnedIds.has(node.nodeId)) return false
            const label = getName(node)?.toLowerCase() ?? ''
            return formValues.queries
                .filter(query => query.value.trim() !== '')
                .some(query => label.includes(query.value.toLowerCase()))
        })
        .map(node=>node.nodeId)
        .filter((id): id is string => id !== undefined)

        const groups = formValues.queries
            .filter(q => q.value.trim() !== '')
            .map(query => [
                query.value,
                ...selectedGraph.nodes
                    .filter(node => {
                        if (node.nodeId && currentPinnedIds.has(node.nodeId)) return false
                        return getName(node)?.toLowerCase().includes(query.value.toLowerCase())
                    })
                    .map(node => node.nodeId)
                    .filter((id): id is string => id !== undefined)
            ])
            .filter(group => group.length > 2)

        const supernodes = [...(visState.subgraph?.supernodes ?? []), ...groups]

        updateVisStateField('pinnedIds', [...visState.pinnedIds, ...matchingNodesIds])
        updateVisStateField('subgraph', {
            ...visState.subgraph,
            sticky: visState.subgraph?.sticky ?? false,
            dagrefy: visState.subgraph?.dagrefy ?? false,
            activeGrouping: visState.subgraph?.activeGrouping ?? { isActive: false, selectedNodeIds: new Set<string>() },
            supernodes,
        });
        form.reset()
        setSpeedAddPopUpOpen(false)
    }

    const handleAppend = () => {
        append({ value: '' }, { shouldFocus: false });
        setTimeout(() => form.setFocus(`queries.${fields.length}.value`), 50);
    }
    

    function SpeedAddModal(){
        return(
            <Dialog open={speedAddPopUpOpen} onOpenChange={(value)=>setSpeedAddPopUpOpen(value)}>
                <DialogContent className="max-w-sm bg-white text-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            Speed Add
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        <div>Add words you think would be related</div>
                    </DialogDescription>
                    <form 
                        onSubmit={form.handleSubmit(handleSpeedAdd)}
                    >
                        <div
                            className="flex flex-col gap-y-2"
                        >
                            {fields.map((field, i) => (
                                <div key={field.id} className="flex gap-2">
                                    <Input 
                                        {...form.register(`queries.${i}.value`)} 
                                        placeholder="e.g. capital" 
                                    />
                                    {fields.length > 1 && (
                                        <button type="button" onClick={() => remove(i)}>
                                            <Minus 
                                                className="w-4 h-4 hover:text-red-500" 
                                                onClick={() => remove(i)}
                                            />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div>
                                <Button
                                    className="w-full bg-white border-2 border-blue-500 group"
                                    onClick={handleAppend}
                                    tabIndex={-1}
                                >
                                    <Plus
                                        className="text-blue-500 group-hover:text-white"
                                    />
                                </Button>
                            </div>
                            <Button
                                className="w-full"
                                type="submit"
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        )
    }


    return (
        <>
            <SpeedAddModal/>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setSpeedAddPopUpOpen(true)
                }}
                className="hidden h-11 w-[86px] flex-col items-center justify-center gap-y-[4px] whitespace-nowrap border border-sky-600 bg-sky-100 px-0 text-[9.5px] font-semibold leading-none text-sky-700 shadow transition-all hover:bg-sky-200 hover:text-sky-700 sm:flex"
                aria-label="Speed Add"
            >
                <>
                    <div className="flex flex-row items-center justify-center gap-x-0">
                    <Zap className="h-3.5 w-3.5" />
                    </div>
                    Speed Add
                </>
            </Button>
        </>
    );
}