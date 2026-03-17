import { Button } from "@/components/shadcn/button";
import { CLTGraph, CLTGraphNode, CltVisState } from "./graph-types";
import { Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/shadcn/dialog';
import { LoadingSpinner } from "@/components/svg/loading-spinner";


export default function AutoGenerateButton({
    selectedGraph,
    visState,
    updateVisStateField,
}: {
    selectedGraph: CLTGraph | null;
    visState: CltVisState;
    updateVisStateField: <K extends keyof CltVisState>(key: K, value: CltVisState[K]) => void;
}) {
    const [autoGeneratePopUpOpen, setAutoGeneratePopUpOpen] = useState<boolean>(false)
    const [autoGenerating, setAutoGenerating] = useState<boolean>(false)
    const abortControllerRef = useRef<AbortController | null>(null);

    async function handleAutoGenerateGraph(){
        abortControllerRef.current = new AbortController();
        type GraphNode = {
          node_id: string;
          feature_id:string|undefined;
          feature_type:string;
          description:string;
          explanations:string[] | null;
          inDegree:number;
          child_ids:string[];
          votes:Record<string, number>;
          votes_casted:number;
          final_name:string
        };
    
        function ConvertToGraphNode(node:CLTGraphNode): GraphNode | undefined {
          if (!node) return
          let explanations = null
          let description = "";
          let votes:Record<string, number> = {}
          if(node.featureDetailNP && node.featureDetailNP.explanations && node.featureDetailNP.explanations[0] && node.featureDetailNP.explanations[0].description){
            description = node.featureDetailNP.explanations[0].description;
          }
          if(node.featureDetailNP && node.featureDetailNP.explanations && node.featureDetailNP.explanations[0] && node.featureDetailNP.explanations[0].explanations){
            explanations = node.featureDetailNP.explanations[0].explanations;
            node.featureDetailNP.explanations[0].explanations.forEach(e => votes[e]=0);
          }else if (description!==""){
            votes[description] = 0;
          }
          let final_name = ""
          if(node.feature_type == "embedding"){
            final_name = node.clerp.trim().replace(/"/g, '').split(/\s+/).pop() || node.clerp;
          }
          if(node.feature_type == "logit"){
            final_name = node.clerp.replace(/"/g, '').trim().split(' ').at(-2)!;
          }
          return {
            node_id:node.node_id,
            feature_id:node.featureId,
            feature_type:node.feature_type,
            description:description,
            explanations:explanations,
            inDegree:0,
            child_ids:[],
            votes:votes,
            votes_casted:0,
            final_name:final_name
          }
        }
    
        // Top K input nodes
        const K = 3;
    
        if (!selectedGraph) return;
        // New list of nodes
        const newPinnedIds: string[] = [];
        const newPinned = new Map<string, GraphNode>();
        // Create a queue
        const queue: GraphNode[] = [];
        // Create a visited set
        const visited = new Set<string>();
        // Find most probable output node
        const outputNode = selectedGraph.nodes
          .filter(n => n.feature_type === 'logit')
          .sort((a, b) => (b.token_prob ?? 0) - (a.token_prob ?? 0))[0];
        if (!outputNode || !outputNode.node_id) return;
        // Add to queue
        const outputNodeConverted = ConvertToGraphNode(outputNode)
        if (!outputNodeConverted){
          console.error("No output node found!")
          return
        }
        queue.push(outputNodeConverted);
        // Add to pinned nodes
        newPinnedIds.push(outputNodeConverted.node_id);
        newPinned.set(outputNodeConverted.node_id, outputNodeConverted);
        // Set as visited
        visited.add(outputNodeConverted.node_id);
        // While queue is not empty
        while (queue.length > 0) {
          // Pop from queue
          const current = queue.shift()!;
          // Skip embedding nodes
          if (current.feature_type === 'embedding') continue;
          // Find top K input nodes
          const outputNodes = selectedGraph.links
            .filter(l => l.target === current.node_id)
            .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
            .map(l => selectedGraph.nodes.find(n => n.node_id === l.source))
            .map(n => n ? ConvertToGraphNode(n) : undefined)
            .filter((n): n is GraphNode => 
              n !== undefined && 
              !visited.has(n.node_id) &&
              n.feature_type !== 'mlp reconstruction error' &&
              (n.feature_type === "embedding" || n.feature_type === "logit" || n.description !="" || n.explanations!=null)
            )
            .slice(0, K);
          for (const node of outputNodes) {
            // set as visited
            visited.add(node.node_id);
            // Add to pinned
            newPinnedIds.push(node.node_id);
            newPinned.set(node.node_id, node);
            // Add to queue
            queue.push(node);
          }
        }
        
        // Update in-degree, childIds
        selectedGraph.links.forEach(l => {
          if (newPinnedIds.includes(l.source) && newPinnedIds.includes(l.target)) {
            const source = newPinned.get(l.source);
            const target = newPinned.get(l.target);
            // REVERSE!! Source here is the child, target is the parent
            if (source) source.inDegree+=1
            if (target) target.child_ids.push(l.source);
          }
        });
    
        // Call API
        const response = await fetch('http://127.0.0.1:5003/v1/auto_generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newPinned:Object.fromEntries(newPinned)
          }),
          signal: abortControllerRef.current.signal
        });
        const data = await response.json();
        const groups = data.groups
        const group_names = data.group_names
        const finalPinnedIds = data.final_pinned_ids
        const finalPinned = data.final_pinned
        if (finalPinnedIds){
          // Update names
          const clerps:string[][] = [];
          finalPinned.forEach((node:GraphNode)=>{
            if (node.feature_id && node.feature_type!="logit" && node.feature_type!="embedding"){
              clerps.push([node.feature_id, node.final_name])
            }
          })
          updateVisStateField('clerps', clerps);
          // Update Pinned nodes
          updateVisStateField('pinnedIds', finalPinnedIds);
        }
        if(groups){
          const supernodes = groups.map((group: string[], i: number) => [group_names[i], ...group]);
          updateVisStateField('subgraph', {
            ...visState.subgraph,
            sticky: visState.subgraph?.sticky ?? false,
            dagrefy: visState.subgraph?.dagrefy ?? false,
            activeGrouping: visState.subgraph?.activeGrouping ?? { isActive: false, selectedNodeIds: new Set<string>() },
            supernodes,
          });
        }
        setAutoGenerating(false);
        setAutoGeneratePopUpOpen(false);
        abortControllerRef.current = null;
    }

    const handleCancel = () => {
        abortControllerRef.current?.abort('User cancelled');
        setAutoGenerating(false);
        setAutoGeneratePopUpOpen(false);
    };

    function AutoGenerateModal(){
        return(
            <Dialog open={autoGeneratePopUpOpen} onOpenChange={(open) => {
                if (!autoGenerating) setAutoGeneratePopUpOpen(open);
            }}>
                <DialogContent className="max-w-sm bg-white text-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            Auto Generate Graph
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-center">
                        <div className="flex flex-col w-full gap-y-3">
                            {!autoGenerating && (
                                <div>This may take a while. Proceed?</div>
                            )}
                            {autoGenerating && (
                                <div className="flex flex-row items-center justify-center gap-x-2">
                                    <LoadingSpinner size={16} className="text-sky-700" />
                                    <div>Auto Generating...</div>
                                </div>
                            )}
                            <div className="flex w-full p-1 gap-x-1">
                                {!autoGenerating && (
                                    <Button
                                        className="flex-1 transition-all duration-300"
                                        onClick={() => {
                                            setAutoGenerating(true);
                                            handleAutoGenerateGraph();
                                        }}
                                    >
                                        Proceed
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    className="flex-1 transition-all duration-300"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        )
    }


    return (
        <>
            <AutoGenerateModal/>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setAutoGeneratePopUpOpen(true)
                }}
                className="hidden h-11 w-[86px] flex-col items-center justify-center gap-y-[4px] whitespace-nowrap border border-sky-600 bg-sky-100 px-0 text-[9.5px] font-semibold leading-none text-sky-700 shadow transition-all hover:bg-sky-200 hover:text-sky-700 sm:flex"
                aria-label="Auto Generate"
            >
                <>
                    <div className="flex flex-row items-center justify-center gap-x-0">
                    <Wand2 className="h-3.5 w-3.5" />
                    </div>
                    Auto Generate
                </>
            </Button>
        </>
    );
}