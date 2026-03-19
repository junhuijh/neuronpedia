'use client'

import { Tour } from "antd";
import type { TourProps } from "antd";
import { useEffect, useState } from "react"
import { useGraphModalContext } from "@/components/provider/graph-modal-provider";



export default function GraphTutorial({
    showTutorial
}:{
    showTutorial:boolean
}){
    const { isTutorialModalOpen, setIsTutorialModalOpen } = useGraphModalContext();

    useEffect(() => {
        if (showTutorial) {
            try{
                const hasVisited = localStorage.getItem('circuit-tracer-visited');
                if (hasVisited) {
                    const hasToured = localStorage.getItem('circuit-tracer-tour-visited');
                    if (hasToured){
                        setIsTutorialModalOpen(true);
                    }
                }
            }catch(e){

            }
        }
    }, []);

    const steps: TourProps["steps"] = [
        {
            title: "Welcome to the tutorial for circuit tracer",
            placement:"center"
        },
        {
            title: "Goal",
            description: "The goal of circuit tracer is to create a subgraph that explains the key interal reasoning steps of the LLM.",
            placement:"center"
        },
        {
            title: "Lets take a walkthrough!",
            placement:"center"
        },
        {
            title: "Link Graph",
            description: (
                <div>
                    <p>The link (or attribution) graph displays the model's reasoning process as a graph. Intermediate steps are represented as nodes, with edges indicating the effect of one node on another.</p>
                    <p>The y-axis represents the layers, starting from the input tokens (Emb), through layer 0 (L0) up to the last layer, followed by the output logits (Lgt)</p>
                    <p>The x-axis groups features by the input token that most strongly activated them</p>
                    <p>■ Input/output tokens</p>
                    <p>● Features</p>
                    <p>◆ Errors</p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Click on a feature node",
            description:"Click on any ● feature node to select it.",
            arrow:true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement:"bottom"
        },
        
        {
            title: "Node Connections",
            description: (
                <div>
                    <p>When you click on a node in the link/attribution graph, you'll see its label on the top left and its connected nodes are displayed below.</p>
                    <p>The currently selected node is highlighted in pink in the link graph.</p>
                    <p>The connected nodes are sorted by weight and separated into input features and output features.</p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.node-connections') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Feature Details",
            description: (
                <div>
                    <p>
                        The logits tell you the output tokens that the feature most strongly pushes the model to say, via direct connections.
                        For later-layer features, these are often the best way to understand what a feature does.
                        For earlier-layer features, they can be misleading.
                    </p>
                    <p>
                        The top activations show the contexts in a dataset that most strongly activated a feature. 
                        Finding the pattern in these contexts helps you determine what a feature represents (label). 
                        The top activations are passed to an autointerpret LLM, which generates the label.
                    </p>
                    <p>
                        If you find a more suitable label, you can edit it by clicking the <strong>Edit</strong> button beside the label.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.feature-details') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Subgraph",
            description: (
                <div>
                    <p>
                        The subgraph is a scratchpad where you pin and group nodes to build your explanation of the model's reasoning.
                    </p>
                    <p>
                        As you identify important features in the link graph, you add them here to form a coherent story of how the model arrived at its output.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.subgraph') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Now let's build a subgraph!",
            description: "We will now build a subgraph.",
            arrow:true,
            placement:"center"
        },
        {
            title: "Add most probable output to subgraph",
            description: (
                <div>
                    <p>
                        <strong>Ctrl</strong> + <strong>Click</strong> the most probable output (top right output node) to add it to the subgraph.
                    </p>
                    <p>
                        We start from the output because we want to understand what led the model to predict this specific token.
                        Working backwards lets us trace only the nodes that actually contributed to this prediction.
                    </p>
                    <p>
                        Click on it again so we can see the input features of the output node.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Add the top 3 input nodes to the subgraph",
            description: (
                <div>
                    <p>
                        For demonstration purposes, we are going with 3 input nodes.
                    </p>
                    <p>
                        Ignore the ◆ error tokens.
                    </p>
                    <p>
                        <strong>Ctrl</strong> + <strong>Click</strong> them to add them to the subgraph.
                    </p>
                    <p>
                        Nodes that are in the subgraph are outlined in black.
                    </p>
                    <p>
                        Click one of the selected nodes.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.node-connections') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Add another 3 input nodes to the subgraph",
            description: (
                <div>
                    <p>
                        <strong>Ctrl</strong> + <strong>Click</strong> on a node that has already been added to the subgraph would remove them from the subgraph.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.node-connections') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "You can also select nodes from the link graph.",
            arrow:true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Repeat this process",
            description: (
                <div>
                    <p>
                        Repeat this process, tracing back through the graph, until you feel you have captured the key concepts that explain the model's reasoning.
                    </p>
                    <p>
                        There is no strict stopping condition.
                        It's a judgment call based on whether the subgraph tells a coherent story.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.top-section') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Grouping",
            description: (
                <div>
                    <p>
                        Related nodes can be grouped together into a supernode.
                    </p>
                    <p>
                        We group nodes because multiple features can represent the same underlying concept.
                        Grouping them makes the subgraph easier to read and reveals the high-level reasoning steps more clearly.
                    </p>
                    <p>
                        Hold <strong>g</strong> and click the nodes you want to group.
                        Releasing <strong>g</strong> creates the supernode.
                    </p>
                    <p>
                        Double-click a supernode's label to rename it.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.subgraph') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Result",
            description: (
                <div>
                    <p>
                        If you have been following along, your subgraph should contain nodes representing "Austin", "Texas", "capital", "cities", "state".
                    </p>
                    <p>
                        This shows that the model reasoned:
                    <p> 
                        1. "Capital" in this context represent a city capital, not financial capital
                    </p>
                    <p> 
                        2. "State" refers to a US state, not the verb "to state".
                    </p>
                    <p> 
                        3. Texas is the state containing Dallas
                    </p>
                    <p> 
                        4. Austin is the capital of Texas, and therefore the answer.
                    </p>
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.subgraph') as HTMLElement,
            placement:"bottom"
        },
        {
            title: "Congratulations",
            description: (
                <div>
                    <p>
                        You have now learned how to use the circuit tracer!
                    </p>
                    <p>
                        A few things to keep in mind as you explore on your own:
                    </p>
                    <p>
                        - There is no strict rule on how many input nodes to add at each step — use your judgment based on what seems most relevant to the model's reasoning.
                    </p>
                    <p>
                        - If you want to replay this tutorial at any time, click the <strong>Tutorial</strong> button in the toolbar.
                    </p>
                    <p> 
                        We can now explore other additional features.
                    </p>
                </div>
            ),
            arrow:true,
            placement:"center"
        },
        {
            title: "Steer",
            description: (
                <div>
                    <p>
                        Steering lets you modify the models's behavior by directly amplifying or suppressing specific features you have pinned in the subgraph.
                    </p>
                    <p>
                        Think of it as surgically changing the way the model thinks. 
                        Instead of prompting it differently, you are directly intervening on its internal activations and observing how the output changes.
                    </p>
                    <p>
                        For example, amplifying the "Texas" feature may make the model more likely to produce Texas-related outputs, while suppressing it may cause it to reason differently entirely.
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.steer-button') as HTMLElement,
            placement:"left"
        },
        {
            title: "Speed Add",
            description: (
                <div>
                    <p>
                        This feature adds all nodes whose labels contain any of the user-specified keywords as a substring.
                    </p>
                    <p>
                        For example, entering "Texas" would add all nodes whose label contains the word "Texas".
                    </p>
                </div>
            ),
            arrow:true,
            target: () => document.querySelector('.speed-add-button') as HTMLElement,
            placement:"left"
        },
        {
            title: "Auto Generate",
            description: (
                <div>
                    <p>
                        This feature attempts to automate the building and labelling of the subgraph.
                    </p>
                    <p>
                        Starting from an output node, it repeatedly adds the top-k input nodes of the current node into a queue, expanding outward to form a large temporary subgraph.
                    </p>
                    <p>
                        Each node's finalised label is determined by a vote among its connected nodes. 
                        The embedding of each node's finalised label is then compared against the candidate labels of its child nodes using cosine similarity. 
                        The top-k candidates above a minimum similarity threshold receive a vote.
                        Nodes that neither received votes nor cast votes are pruned from the subgraph.
                    </p>
                    <p>
                        Finally, the remaining nodes are grouped using agglomerative clustering on their label embeddings, automatically forming supernodes for semantically related concepts.
                    </p>
                </div>
            ),
            target: () => document.querySelector('.auto-generate-button') as HTMLElement,
            arrow:true,
            placement:"left"
        },
    ];

    const handleClose = () => {
        setIsTutorialModalOpen(false);
        localStorage.setItem('circuit-tracer-tour-seen', 'true')
    };

    return(
        <Tour
            open={isTutorialModalOpen}
            onClose={handleClose}
            onFinish={handleClose}
            steps={steps}
        />
    )
}