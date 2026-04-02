import { Button } from "@/components/shadcn/button";
import { CLTGraph, CLTGraphNode, CltVisState } from "./graph-types";
import { Wand2, HelpCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/shadcn/dialog';
import { LoadingSpinner } from "@/components/svg/loading-spinner";
import { useForm } from "react-hook-form";
import * as Tooltip from '@radix-ui/react-tooltip';
import { useGraphModalContext } from "@/components/provider/graph-modal-provider";
import { FYP_SERVER } from '@/lib/env';


type AutoGenerateGraphForm = {
  output_node_id: string,
  inputs_scanned_per_node: number,
  max_votes_per_node: number,
  min_similarity_vote: number,
  min_similarity_group: number,
}

function AutoGenerateModal({
  defaultValues,
  outputNodes,
  autoGenerating,
  isAutoGenerateModalOpen,
  setIsAutoGenerateModalOpen,
  handleAutoGenerateGraph,
  handleCancel,
}: {
  defaultValues: AutoGenerateGraphForm;
  outputNodes: CLTGraphNode[];
  isAutoGenerateModalOpen: boolean;
  setIsAutoGenerateModalOpen: (open: boolean) => void;
  autoGenerating: boolean;
  handleAutoGenerateGraph: (formValues: AutoGenerateGraphForm) => Promise<void>;
  handleCancel: () => void;
}) {
  const form = useForm<AutoGenerateGraphForm>({
    defaultValues: defaultValues
  })
  return (
    <Dialog
      open={isAutoGenerateModalOpen}
      onOpenChange={(open) => {
        if (!autoGenerating) setIsAutoGenerateModalOpen(open);
      }}
    >
      <DialogContent className="max-w-sm bg-white text-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Auto Generate Graph
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleAutoGenerateGraph)}>
          <div className="flex flex-col w-full gap-y-3">
            <div className="flex flex-col gap-1">
              <label>Output Node</label>
              <select
                {...form.register("output_node_id")}
              >
                {outputNodes.map(node => (
                  <option
                    key={node.nodeId}
                    value={node.nodeId}
                    disabled={autoGenerating}
                  >
                    {node.clerp.replace(/"/g, '').trim()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex w-full gap-1">
                Inputs Scanned Per Node: {form.watch("inputs_scanned_per_node")}
                <Tooltip.Provider delayDuration={300} skipDelayDuration={0}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="flex items-center">
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="rounded bg-slate-500 px-3 py-2 text-xs text-white z-[999]" sideOffset={5}>
                        Number of top input nodes to explore per node during BFS traversal.
                        <Tooltip.Arrow className="fill-slate-500" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                disabled={autoGenerating}
                {...form.register("inputs_scanned_per_node", { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex w-full gap-1">
                Max Votes Per Node: {form.watch("max_votes_per_node")}
                <Tooltip.Provider delayDuration={300} skipDelayDuration={0}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="flex items-center">
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="rounded bg-slate-500 px-3 py-2 text-xs text-white z-[999]" sideOffset={5}>
                        A node can cast at most 1 vote per child's candidate name, up to a maximum of X votes total.
                        <Tooltip.Arrow className="fill-slate-500" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                disabled={autoGenerating}
                {...form.register("max_votes_per_node", { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex w-full gap-1">
                Min Vote Similarity: {form.watch("min_similarity_vote").toFixed(2)}
                <Tooltip.Provider delayDuration={300} skipDelayDuration={0}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="flex items-center">
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="rounded bg-slate-500 px-3 py-2 text-xs text-white z-[999]" sideOffset={5}>
                        Minimum similarity between a node's finalised name and a candidate name of its input node to count as a vote.
                        <Tooltip.Arrow className="fill-slate-500" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                disabled={autoGenerating}
                {...form.register("min_similarity_vote", { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex w-full gap-1">
                Min Group Similarity: {form.watch("min_similarity_group").toFixed(2)}
                <Tooltip.Provider delayDuration={300} skipDelayDuration={0}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="flex items-center">
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="rounded bg-slate-500 px-3 py-2 text-xs text-white z-[999]" sideOffset={5}>
                        Minimum similarity between finalised name of nodes to be considered related enough to form a group.
                        <Tooltip.Arrow className="fill-slate-500" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                disabled={autoGenerating}
                {...form.register("min_similarity_group", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col w-full gap-y-3 items-center">
              {!autoGenerating && (
                <div>This may take a while. Proceed?</div>
              )}
              {autoGenerating && (
                <div className="flex flex-row items-center justify-center gap-x-2">
                  <LoadingSpinner size={16} className="text-sky-700" />
                  <div>Auto Generating...</div>
                </div>
              )}
            </div>
            <div className="flex w-full p-1 gap-x-1">
              {!autoGenerating && (
                <Button
                  type="submit"
                  className="flex-1 transition-all duration-300"
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
        </form>
      </DialogContent>
    </Dialog>
  )
}

type GraphNode = {
  node_id: string;
  feature_id: string | undefined;
  feature_type: string;
  description: string;
  explanations: string[] | null;
  inDegree: number;
  child_ids: string[];
  votes: Record<string, number>;
  votes_casted: number;
  final_name: string
};

function ConvertToGraphNode(node: CLTGraphNode): GraphNode | undefined {
  if (!node) return
  let explanations = null
  let description = "";
  let votes: Record<string, number> = {}
  if (node.featureDetailNP && node.featureDetailNP.explanations && node.featureDetailNP.explanations[0] && node.featureDetailNP.explanations[0].description) {
    description = node.featureDetailNP.explanations[0].description;
  }
  if (node.featureDetailNP && node.featureDetailNP.explanations && node.featureDetailNP.explanations[0] && node.featureDetailNP.explanations[0].explanations) {
    explanations = node.featureDetailNP.explanations[0].explanations;
    if (description !== "" && !explanations.includes(description)) {
      explanations = [description, ...explanations];
    }
    explanations.forEach(e => votes[e] = 0);
  } else if (description !== "") {
    votes[description] = 0;
  }
  let final_name = ""
  if (node.feature_type == "embedding") {
    final_name = node.clerp.trim().replace(/"/g, '').split(/\s+/).pop() || node.clerp;
  }
  if (node.feature_type == "logit") {
    final_name = node.clerp.replace(/"/g, '').trim().split(' ').at(-2)!;
  }
  return {
    node_id: node.node_id,
    feature_id: node.featureId,
    feature_type: node.feature_type,
    description: description,
    explanations: explanations,
    inDegree: 0,
    child_ids: [],
    votes: votes,
    votes_casted: 0,
    final_name: final_name
  }
}

export default function AutoGenerateButton({
  selectedGraph,
  visState,
  updateVisStateField,
}: {
  selectedGraph: CLTGraph | null;
  visState: CltVisState;
  updateVisStateField: <K extends keyof CltVisState>(key: K, value: CltVisState[K]) => void;
}) {
  if (!selectedGraph) return
  const { isAutoGenerateModalOpen, setIsAutoGenerateModalOpen } = useGraphModalContext();
  const [autoGenerating, setAutoGenerating] = useState<boolean>(false)
  const outputNodes = selectedGraph.nodes
    .filter(n => n.feature_type === 'logit')
    .sort((a, b) => (b.token_prob ?? 0) - (a.token_prob ?? 0));
  const defaultValues = {
    output_node_id: outputNodes[0].nodeId || "",
    inputs_scanned_per_node: 3,
    max_votes_per_node: 2,
    min_similarity_vote: 0.6,
    min_similarity_group: 0.8
  }
  // Dallas - 0.75


  const abortControllerRef = useRef<AbortController | null>(null);

  async function handleAutoGenerateGraph(formValues: AutoGenerateGraphForm) {
    setAutoGenerating(true)
    abortControllerRef.current = new AbortController();
    // Top input nodes scanned per node
    const inputs_scanned_per_node = formValues.inputs_scanned_per_node;
    const output_node_id = formValues.output_node_id
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
      .filter(node => node.nodeId === output_node_id)[0];
    if (!outputNode || !outputNode.node_id) return;
    // Find seeds
    const seedsResponse = await fetch(`${FYP_SERVER}/fyp/seeds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt:selectedGraph.metadata.prompt })
    })
    const seedsData = await seedsResponse.json()
    let seedNodes:CLTGraphNode[] = []
    if (seedsData.filtered){
      // Filter for seed nodes
      const seedsNodesResponse = await fetch(`${FYP_SERVER}/fyp/filter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: seedsData })
      })
      const seedNodesData = await seedsNodesResponse.json()
      const seedNodesInfo:{layer:string, index:string}[] = seedNodesData.filtered
      seedNodes = seedNodesInfo.flatMap(seedInfo =>
        selectedGraph.nodes.filter(node =>
          node.featureDetailNP?.layer === seedInfo.layer &&
          node.featureDetailNP?.index === seedInfo.index
        )
      )
    }
    // Add to queue
    for (let node of [outputNode, ...seedNodes]) {
      const convertedNode = ConvertToGraphNode(node)
      if (!convertedNode) {
        continue
      }
      queue.push(convertedNode);
      newPinnedIds.push(convertedNode.node_id);
      newPinned.set(convertedNode.node_id, convertedNode)
      visited.add(convertedNode.node_id);
    }
    // While queue is not empty
    while (queue.length > 0) {
      // Pop from queue
      const current = queue.shift()!;
      // Skip embedding nodes
      if (current.feature_type === 'embedding') continue;
      // Find top K input nodes
      let outputNodes: GraphNode[] = []
      if (current.feature_type === 'logit') {
        // if its logit, take features only
        outputNodes = selectedGraph.links
          .filter(l => l.target === current.node_id)
          .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
          .map(l => selectedGraph.nodes.find(n => n.node_id === l.source))
          .map(n => n ? ConvertToGraphNode(n) : undefined)
          .filter((n): n is GraphNode =>
            n !== undefined &&
            !visited.has(n.node_id) &&
            n.feature_type !== 'mlp reconstruction error' &&
            n.feature_type !== 'embedding' &&
            (n.description != "" || n.explanations != null)
          )
          .slice(0, inputs_scanned_per_node);
      } else {
        outputNodes = selectedGraph.links
          .filter(l => l.target === current.node_id)
          .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
          .map(l => selectedGraph.nodes.find(n => n.node_id === l.source))
          .map(n => n ? ConvertToGraphNode(n) : undefined)
          .filter((n): n is GraphNode =>
            n !== undefined &&
            !visited.has(n.node_id) &&
            n.feature_type !== 'mlp reconstruction error' &&
            (n.feature_type === "embedding" || n.feature_type === "logit" || n.description != "" || n.explanations != null)
          )
          .slice(0, inputs_scanned_per_node);
      }
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
        if (source && target) {
          if (!target.child_ids.includes(l.source)) {
            source.inDegree += 1
            target.child_ids.push(l.source);
          } else {
            console.log("Duplicate Found?")
          }
        }
      }
    });

    // Call API
    const response = await fetch(`${FYP_SERVER}/fyp/auto_generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newPinned: Object.fromEntries(newPinned),
        max_votes_per_node: formValues.max_votes_per_node,
        min_similarity_vote: formValues.min_similarity_vote,
        min_similarity_group: formValues.min_similarity_group
      }),
      signal: abortControllerRef.current.signal
    });
    const data = await response.json();
    const groups = data.groups
    const group_names = data.group_names
    const finalPinnedIds = data.final_pinned_ids
    const finalPinned = data.final_pinned
    if (finalPinnedIds) {
      // Update names
      const clerps: string[][] = [];
      finalPinned.forEach((node: GraphNode) => {
        if (node.feature_id && node.feature_type != "logit" && node.feature_type != "embedding") {
          clerps.push([node.feature_id, node.final_name])
        }
      })
      updateVisStateField('clerps', clerps);
      // Update Pinned nodes
      updateVisStateField('pinnedIds', finalPinnedIds);
    }
    if (groups) {
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
    setIsAutoGenerateModalOpen(false);
    abortControllerRef.current = null;
  }

  const handleCancel = () => {
    abortControllerRef.current?.abort('User cancelled');
    setAutoGenerating(false);
    setIsAutoGenerateModalOpen(false);
  };




  return (
    <>
      <AutoGenerateModal
        defaultValues={defaultValues}
        outputNodes={outputNodes}
        isAutoGenerateModalOpen={isAutoGenerateModalOpen}
        setIsAutoGenerateModalOpen={setIsAutoGenerateModalOpen}
        autoGenerating={autoGenerating}
        handleAutoGenerateGraph={handleAutoGenerateGraph}
        handleCancel={handleCancel}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsAutoGenerateModalOpen(true)
        }}
        className="auto-generate-button hidden h-11 w-[86px] flex-col items-center justify-center gap-y-[4px] whitespace-nowrap border border-sky-600 bg-sky-100 px-0 text-[9.5px] font-semibold leading-none text-sky-700 shadow transition-all hover:bg-sky-200 hover:text-sky-700 sm:flex"
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