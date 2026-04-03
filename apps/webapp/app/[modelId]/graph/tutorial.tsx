'use client'

import { Tour } from "antd";
import type { TourProps } from "antd";
import { useEffect, useState } from "react"
import { useGraphModalContext } from "@/components/provider/graph-modal-provider";
import UAE from "@/components/tutorial/UAE.png"
import CLT from "@/components/tutorial/CLT.png"
import Tutorial from "@/components/tutorial/Tutorial.png"
import LinkGraphGif from "@/components/tutorial/LinkGraph.gif"
import NodeConnectionsGif from "@/components/tutorial/NodeConnections.gif"

function Space() {
    return (
        <div className="h-2" />
    )
}

function Token({
    token,
    colourString = "bg-slate-100"
}: {
    token: string,
    colourString?: string
}) {
    return (
        <span className={`inline-block px-2 py-0.5 rounded  border border-slate-300 text-slate-800 text-sm font-mono mx-0.5 ${colourString}`}>
            {token}
        </span>
    )
}

const EmbeddingSpace = () => {
    const groups = [
        {
            label: 'Fruits',
            fill: '#FF5555',
            stroke: '#AA0000',
            text: '#AA0000',
            words: [
                { label: 'Apple', x: 80, y: 60 },
                { label: 'Orange', x: 130, y: 90 },
                { label: 'Lemon', x: 65, y: 105 },
                { label: 'Pear', x: 120, y: 125 },
            ],
        },
        {
            label: 'Animals',
            fill: '#55FF55',
            stroke: '#00AA00',
            text: '#00AA00',
            words: [
                { label: 'Dog', x: 280, y: 50 },
                { label: 'Cat', x: 330, y: 80 },
                { label: 'Chicken', x: 265, y: 95 },
                { label: 'Duck', x: 320, y: 115 },
            ],
        },
        {
            label: 'Country',
            fill: '#5555FF',
            stroke: '#0000AA',
            text: '#0000AA',
            words: [
                { label: 'America', x: 180, y: 225 },
                { label: 'China', x: 215, y: 185 },
                { label: 'Japan', x: 210, y: 210 },
            ],
        },
    ]

    return (
        <svg
            width="100%"
            viewBox="0 0 400 260"
            className="my-2"
        >
            {groups.map(({ label, fill, stroke, text, words }) => (
                <g key={label}>
                    {words.map(w => (
                        <g key={w.label}>
                            <circle
                                cx={w.x}
                                cy={w.y}
                                r="7"
                                fill={fill}
                                stroke={stroke}
                                strokeWidth="1"
                            />
                            <text
                                x={w.x + 11}
                                y={w.y + 4}
                                fontSize="11"
                                fill={text}
                            >
                                {w.label}
                            </text>
                        </g>
                    ))}
                </g>
            ))}
        </svg>
    )
}

const AttentionConversation = () => {
    const examples = [
        {
            asker: 'tallest',
            question: 'Who am I referring to?',
            askerColour: "amber",
            responder: 'building',
            answer: 'Me! I am the tallest.',
            responderColour: "purple"
        },
        {
            asker: 'car',
            question: 'What is my colour?',
            askerColour: "cyan",
            responder: 'red',
            answer: 'You are red!',
            responderColour: "red"
        },
    ]
    const colorMap: Record<string, string> = {
        amber: 'border-amber-300 bg-amber-50 text-amber-800 border-amber-200 text-amber-900',
        purple: 'border-purple-300 bg-purple-50 text-purple-800 border-purple-200 text-purple-900',
        cyan: 'border-cyan-300 bg-cyan-50 text-cyan-800 border-cyan-200 text-cyan-900',
        red: 'border-red-300 bg-red-50 text-red-800 border-red-200 text-red-900',
    }



    return (
        <div className="flex flex-col gap-4 my-4">
            {examples.map(({ asker, askerColour, question, responder, responderColour, answer }) => {
                const ac = colorMap[askerColour]
                const rc = colorMap[responderColour]
                return (
                    <div key={asker} className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                            <span className={`px-2 py-0.5 rounded border text-xs font-mono shrink-0 mt-1 ${ac}`}>
                                {asker}
                            </span>
                            <div className={`border rounded-lg rounded-tl-none px-3 py-2 text-sm ${ac}`}>
                                {question}
                            </div>
                        </div>

                        <div className="flex items-start gap-2 self-end flex-row-reverse">
                            <span className={`px-2 py-0.5 rounded border text-xs font-mono shrink-0 mt-1 ${rc}`}>
                                {responder}
                            </span>
                            <div className={`border rounded-lg rounded-tr-none px-3 py-2 text-sm ${rc}`}>
                                {answer}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const MLPLayer = () => {
    const neurons = [
        {
            concept: 'fruit',
            input: 'Lemon',
            found: true,
            output: '0.91',
        },
        {
            concept: 'country',
            input: 'Lemon',
            found: false,
            output: '0',
        },
    ]

    return (
        <div className="flex w-full justify-center">
            <div className="flex flex-col gap-4 my-4">
                {neurons.map(({ concept, input, found, output }) => (
                    <div key={concept} className="flex items-center gap-3">
                        <Token token={input} />
                        <div className="h-[1px] w-6 bg-slate-300" />
                        <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 shrink-0 text-xs text-center font-medium
                                ${found
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : 'border-slate-200 bg-slate-50 text-slate-400'
                            }`}
                        >
                            <span className="text-[10px] font-normal opacity-60">neuron</span>
                            <span className="text-[10px] font-normal opacity-60">looking for</span>

                            <span>{concept}</span>
                        </div>
                        <div className="h-[1px] w-6 bg-slate-300" />
                        <div className="flex flex-col gap-1">
                            <span className={`text-sm font-mono font-medium ${found ? 'text-green-700' : 'text-slate-400'}`}>
                                {output}
                            </span>
                            <span className="text-xs text-slate-400">
                                {found ? 'Found it! Fires.' : 'Not found.'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const MLPDiagram = () => {
    const nodeSize = 20
    const nodeGap = 12
    const layerGap = 60
    const paddingX = 20
    const paddingY = 20

    const layers = [
        { label: 'Input', nodes: 3 },
        { label: 'Neurons', nodes: 5 },
        { label: 'Output', nodes: 3 },
    ]

    const maxNodes = Math.max(...layers.map(l => l.nodes))
    const svgHeight = maxNodes * nodeSize + (maxNodes - 1) * nodeGap + paddingY * 2
    const svgWidth = layers.length * nodeSize + (layers.length - 1) * layerGap + paddingX * 2

    const getLayerNodes = (count: number, layerIndex: number) => {
        const layerHeight = count * nodeSize + (count - 1) * nodeGap
        const startY = (svgHeight - layerHeight) / 2
        const x = paddingX + layerIndex * (nodeSize + layerGap)
        return Array.from({ length: count }, (_, i) => ({
            x,
            y: startY + i * (nodeSize + nodeGap),
            layer: layerIndex,
        }))
    }

    const allNodes = layers.flatMap((l, i) => getLayerNodes(l.nodes, i))

    return (
        <div className="flex flex-col items-center gap-3 my-4">
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                {allNodes
                    .filter(from => from.layer < layers.length - 1)
                    .flatMap(from =>
                        allNodes
                            .filter(to => to.layer === from.layer + 1)
                            .map((to, j) => (
                                <line
                                    key={`${from.layer}-${from.y}-${j}`}
                                    x1={from.x + nodeSize}
                                    y1={from.y + nodeSize / 2}
                                    x2={to.x}
                                    y2={to.y + nodeSize / 2}
                                    stroke="#e2e8f0"
                                    strokeWidth="1"
                                />
                            ))
                    )}

                {allNodes.map((node, i) => (
                    <rect
                        key={i}
                        x={node.x}
                        y={node.y}
                        width={nodeSize}
                        height={nodeSize}
                        rx={4}
                        fill="#fffbeb"
                        stroke="#f59e0b"
                        strokeWidth="1"
                    />
                ))}
            </svg>

            <div className="flex gap-[60px]">
                {layers.map(l => (
                    <span key={l.label} className="text-xs text-slate-400 text-center">
                        {l.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

const UnembeddingStep = () => {
    return (
        <div className="flex items-center gap-x-3 my-3 justify-center">
            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">Final vector</span>
                <div className="border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-700 bg-white">
                    [0.91, 0.23, 0.77 ...]
                </div>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs opacity-0">-</span>
                <span className="text-slate-400 text-lg">x</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">Unembedding matrix</span>
                <div className="border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-500 bg-slate-100">
                    50,000 rows
                </div>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs opacity-0">-</span>
                <span className="text-slate-400 text-lg">=</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">Scores</span>
                <div className="border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-700 bg-white">
                    [3.2, 1.1, 0.4, 2.8 ...]
                </div>
            </div>
        </div>
    )
}

const SoftMaxStep = () => {
    const tokens = [
        { word: 'UAE', pct: 85 },
        { word: 'Japan', pct: 10 },
        { word: 'China', pct: 4 },
        { word: '...', pct: 1 },
    ]

    return (
        <div className="flex items-center gap-x-3 my-3 justify-center">
            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">Scores</span>
                <div className="border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-700 bg-white">
                    [3.2, 1.1, 0.4, 2.8 ...]
                </div>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs opacity-0">-</span>
                <span className="text-slate-400 text-lg">→</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">SoftMax</span>
                <div className="border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-500 bg-slate-100">
                    softmax()
                </div>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs opacity-0">-</span>
                <span className="text-slate-400 text-lg">→</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">Probabilities</span>
                <div className="border border-slate-300 rounded-lg p-2 bg-white flex flex-col gap-1.5 min-w-[140px]">
                    {tokens.map(({ word, pct }) => (
                        <div key={word} className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-600 w-10">{word}</span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-slate-500 rounded-full"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="font-mono text-xs text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                    ))}
                    <p className="text-xs text-slate-400 mt-1 text-center">sums to 100%</p>
                </div>
            </div>
        </div>
    )
}

const LLMRepeat = () => {
    const sequences = [
        ["The", "country", "that", "has", "the", "tallest", "building", "in", "the", "world", "is"],
        ["The", "country", "that", "has", "the", "tallest", "building", "in", "the", "world", "is", "UAE"],
        ["The", "country", "that", "has", "the", "tallest", "building", "in", "the", "world", "is", "UAE", "."],
        ["The", "country", "that", "has", "the", "tallest", "building", "in", "the", "world", "is", "UAE", ".", "<|endoftext|>"],
    ]

    const [seqIndex, setSeqIndex] = useState(0)
    const [tokenCount, setTokenCount] = useState(sequences[0].length)

    useEffect(() => {
        const currentSeq = sequences[seqIndex]

        if (tokenCount < currentSeq.length) {
            const t = setTimeout(() => setTokenCount(tokenCount + 1), 400)
            return () => clearTimeout(t)
        } else {
            const t = setTimeout(() => {
                const next = (seqIndex + 1) % sequences.length
                setSeqIndex(next)
                setTokenCount(sequences[next].length - 1)
            }, 1000)
            return () => clearTimeout(t)
        }
    }, [seqIndex, tokenCount])

    const currentTokens = sequences[seqIndex].slice(0, tokenCount)
    const nextToken = sequences[seqIndex][tokenCount]

    return (
        <div className="flex flex-wrap gap-1 my-4 items-center">
            {currentTokens.map((token, i) => (
                <Token key={i} token={token} />
            ))}
            {nextToken && (
                <span className="flex items-center gap-1">
                    <span className="text-slate-400">→</span>
                    <Token token={nextToken} colourString="bg-green-100 border-green-300" />
                </span>
            )}
        </div>
    )
}

const SAEStep = () => {
    return (
        <div className="flex items-center gap-x-3 my-3 justify-center flex-wrap">

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">MLP vector</span>
                <div className="border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-700 bg-white">
                    [0.91, 0.23,<br />0.77, 0.44,<br />0.12 ...]
                </div>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">encode</span>
                <span className="text-slate-300 text-lg">→</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">neurons</span>
                <div className="grid grid-cols-4 gap-1 p-2 border border-slate-200 rounded-lg bg-white">
                    {[false, true, false, false, false, false, false, true, false, false, true, false].map((firing, i) => (
                        <div
                            key={i}
                            className={`w-5 h-5 rounded border ${firing
                                ? 'bg-amber-100 border-amber-400 animate-pulse'
                                : 'bg-slate-100 border-slate-200'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-xs text-slate-400">3 of 12 fire</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">decode</span>
                <span className="text-slate-300 text-lg">→</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">reconstructed</span>
                <div className="border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-700 bg-white">
                    [0.90, 0.24,<br />0.76, 0.45,<br />0.11 ...]
                </div>
                <span className="text-xs text-slate-400">≈ original</span>
            </div>

        </div>
    )
}

const FeatureDetails = () => {
    return (
        <div className="w-full flex justify-center">
            <Token token="Activations" />
            →
            <Token token="Auto-interpret LLM" />
            →
            <Token token="Labels" />
        </div>
    )
}

export default function GraphTutorial({
    showTutorial
}: {
    showTutorial: boolean
}) {
    const { isTutorialModalOpen, setIsTutorialModalOpen } = useGraphModalContext();


    useEffect(() => {
        if (showTutorial) {
            try {
                const hasToured = localStorage.getItem('circuit-tracer-tour-visited');
                if (!hasToured) {
                    setIsTutorialModalOpen(true);
                }
            } catch (e) {

            }
        }
    }, []);

    const steps: TourProps["steps"] = [
        {
            title: "Welcome to the tutorial for circuit tracer",
            placement: "center"
        },
        {
            title: "Goal",
            description: (
                <div>
                    <p>{`The goal of Circuit Tracer is to create a story of how the LLM came to the final output`}</p>
                    <p>{`When answering the question: \"What is the country that has the tallest building in the world?\", `}</p>
                    <p>{`We would first think of the tallest building in the world (Burj Khalifa), then think of where Burj Khalifa is from, UAE. `}</p>
                    <div className="w-full flex flex-col items-center">
                        <img
                            src={UAE.src}
                            alt="UAE"
                            className="w-[50%]"
                        />
                    </div>
                    <p>Circuit Tracer traces exactly this chain — showing which concepts led to which, step by step.</p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Terminologies",
            description: "Before we begin, we must understand some terminologies first.",
            placement: "center"
        },
        {
            title: "Tokens",
            description: (
                <div>
                    <p>When you type a sentence into an LLM, it breaks your text into small pieces called <strong>tokens</strong>.</p>
                    <div className="w-full flex justify-center">
                        <Token token={"Unbelievable"} />→
                        <Token token={"Un"} colourString="bg-red-100" />
                        <Token token={"believ"} />
                        <Token token={"able"} colourString="bg-purple-100" />
                    </div>
                    <Space />
                    <p>Why not just use words?</p>
                    <Space />
                    <p>There are hundreds of thousands of words in just the English language alone. In a model that supports multiple language, there would simply be too many words for the model to memorize. Tokens solve this issue as they can be reused to form the different words.</p>
                    <Space />
                    <p>Tokens solve this issue as they can be reused to form the different words.</p>
                    <div className="w-full flex justify-center gap-x-2">
                        <div>
                            <Token token={"Un"} colourString="bg-red-100" />
                            <Token token={"believ"} />
                            <Token token={"able"} colourString="bg-purple-100" />
                        </div>

                        <div>
                            <Token token={"C"} colourString="bg-blue-100" />
                            <Token token={"able"} colourString="bg-purple-100" />
                        </div>

                        <div>
                            <Token token={"Un"} colourString="bg-red-100" />
                            <Token token={"iverse"} colourString="bg-green-100" />
                        </div>
                    </div>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Embeddings",
            description: (
                <div>
                    <p>Tokens are still language, which computers do not understand language. So each token gets converted into a list of numbers called an <strong>embedding</strong>.</p>
                    <Space />
                    <p>Why numbers? Computers are extremely good at doing math with numbers.</p>
                    <div className="flex items-center gap-4 my-4">
                        <Token token="Chick" />
                        <span className="text-gray-400 text-lg">{"=>"}</span>
                        <div className="border border-slate-300 bg-slate-50 rounded-lg overflow-hidden text-xs font-mono">
                            <div className="grid grid-cols-6">
                                {["0.12", "0.34", "0.22", "0.13", "0.41", "..."].map((value, i) => (
                                    <div key={i} className="px-2 py-1.5 bg-slate-50 text-slate-800 w-12 text-center">
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">Thousands of values</span>
                    </div>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Embeddings",
            description: (
                <div>
                    <p>These numbers are not random, tokens that are related or similar in meaning would have values that are close together.</p>
                    <EmbeddingSpace />
                </div>
            ),
            placement: "center"
        },
        {
            title: "Transformer",
            description: (
                <div>
                    <p>A Transformer is made of matrices (2 dimensional vectors) stacked on top of each other in layers.</p>
                    <Space />
                    <p>There are 2 main components of a Transformer layer:</p>
                    <p className="mx-1"><strong>1. Attention layer</strong></p>
                    <p className="mx-1"><strong>2. MLP layer</strong></p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "The Attention Layer",
            description: (
                <div>
                    <p>The Attention Layer is not fully understood. But, we do know that this is where tokens "talk to each other". </p>
                    <p>Every tokens shares about themselves, and at the same time listen in to other tokens to find out who is relevant to it.</p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "The Attention Layer",
            description: (
                <div>
                    <p>{`The way a token listens can be described as asking questions.`}</p>
                    <p>{`For example:`}</p>
                    <p className="mx-1">{`- The token \"tallest\" might ask: \"Who am I referring to?\"`}</p>
                    <p className="mx-1">{`- The token \"car\" might ask: \"What is my colour?\"`}</p>
                    <AttentionConversation />
                </div>
            ),
            placement: "center"
        },
        {
            title: "The MLP layer",
            description: (
                <div>
                    <p>Not much is known about the MLP layer either. </p>
                    <p>Most scientist suspect this is where knowledge, like facts and relationship, is stored.</p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "The MLP layer",
            description: (
                <div>
                    <p>Think back to the token that just came out from the Attention Layer.</p>
                    <p>It has absorbed new information and now it needs to process the new information. </p>
                    <p>It does this through neurons, which are thousands of small computational units packed inside the MLP layer.</p>
                    <MLPDiagram />
                </div>
            ),
            placement: "center"
        },
        {
            title: "The MLP layer",
            description: (
                <div>
                    <p>Each neuron takes in the token's vector, does some math on it and outputs a number. </p>
                    <Space />
                    <p>It can be seen as each neuron looking for the presence of a specific concept.</p>
                    <p>If present, it fires and outputs and number. If absent, it outputs 0.</p>
                    <MLPLayer />
                </div>
            ),
            placement: "center"
        },
        {
            title: "LLM",
            description: (
                <div>
                    <p>LLM is a Transformer.</p>
                    <p>Tokens repeatedly go through the process of talking and listening to each other and processing the new information. </p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "LLM",
            description: (
                <div>
                    <p>{`The final layer of the LLM has an extra job to do, which is to ask \"Given everything we now know, what is the most probable next token?\".`}</p>
                    <Space />
                    <p>{`To answer that, the model takes the final token's vector and dot products it with the <strong>unembedding matrix</strong>, to obtain a score for every token in the model's vocabulary.`}</p>
                    <Space />
                    <p>{`This is akin to holding information about an unknown fruit and comparing it against all the fruits that you know and giving them a score.`}</p>
                    <UnembeddingStep />
                </div>
            ),
            placement: "center"
        },
        {
            title: "LLM",
            description: (
                <div>
                    <p>A function, <strong>SoftMax</strong>, is then used to convert the raw scores into percentages that add up to 100%, so we can treat them as <strong>probabilities</strong>.</p>
                    <SoftMaxStep />
                </div>
            ),
            placement: "center"
        },
        {
            title: "LLM",
            description: (
                <div>
                    <p>The token with the highest probability becomes the next token in the response.</p>
                    <div>
                        <Token token={"The"} />
                        <Token token={"country"} />
                        <Token token={"that"} />
                        <Token token={"has"} />
                        <Token token={"the"} />
                        <Token token={"tallest"} />
                        <Token token={"building"} />
                        <Token token={"in"} />
                        <Token token={"the"} />
                        <Token token={"world"} />
                        <Token token={"is"} />
                        <span className="text-slate-400 text-lg">→</span>
                        <Token token={"UAE"} />
                    </div>
                </div>
            ),
            placement: "center"
        },
        {
            title: "LLM",
            description: (
                <div>
                    <p>
                        {"The LLM then adds that token runs this whole process again, repeating until it runs into a special end token"}
                        <Token token={"<|endoftext|>"} />
                        {"which signals that the response is complete and to stop generating."}
                    </p>
                    <LLMRepeat />
                </div>
            ),
            placement: "center"
        },
        {
            title: "Now we know how an LLM works. Now lets learn about the tools used to better understand the LLM",
            description: (
                <div>
                    <p></p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Sparse Auto Encoder (SAE)",
            description: (
                <div>
                    <p>In the MLP layer, many neurons can fire at the same time, which makes it hard to extract the concrete concept. </p>
                    <Space />
                    <p>This is where the SAE comes in. A Sparse Autoencoder (SAE) is a tool trained to take in the inputs of the MLP layer and replicate them as its output.</p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Sparse Auto Encoder (SAE)",
            description: (
                <div>
                    <p>It does this in two steps.</p>
                    <p>First, it encodes the input, compressing it in a way that causes only a very small number of its neurons to fire.</p>
                    <Space />
                    <p>Then, using only those few fired neurons, it decodes to reconstruct the original input as accurately as possible.</p>
                    <SAEStep />
                    <p>Because only a small number of neurons are allowed to fire, each one is forced to stand for something specific. These are called <strong>features</strong>.</p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Cross Layer Transcoder (CLT)",
            description: (
                <div>
                    <p>With SAEs we can know if the model had thought of a feature. But, it doesn't show how much that feature impacted the result of the output. </p>
                    <Space />
                    <p>This is resolved with CLT. </p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Cross Layer Transcoder (CLT)",
            description: (
                <div>
                    <p>CLT connects its output to all later layers. This way, we can trace how one feature influenced another feature in a later layer, and eventually the output.</p>
                    <div className="flex w-full justify-center">
                        <img
                            src={CLT.src}
                            alt="CLT    "
                            className="w-[50%]"
                        />
                    </div>
                    <Space />
                    <p>This brings us back to our goal of finding out how the LLM came to the final output. Now lets take a look at the website.</p>
                </div>
            ),
            placement: "center"
        },
        {
            title: "Link (Attribution) Graph",
            description: (
                <div>
                    <p>The Link, or Attribution, Graph is the visual representation of the connections of the features.</p>
                    <Space />
                    <p>The graph is organized in layers from bottom to top. </p>
                    <p>At the very bottom are the ■ <strong>embedding nodes</strong>, the tokens from your input.</p>
                    <p>At the very top are the ■ <strong>output nodes</strong>, the top candidate next tokens, ranked from highest probability on the right to lowest on the left. </p>
                    <p>Everything in between are the ● <strong>feature nodes</strong>, the concepts the model thought about along the way.</p>
                    <p>There are some ◆ <strong>error nodes</strong> that you can ignore.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Link (Attribution) Graph",
            description: (
                <div>
                    <p><Token token="Click" />on any ● <strong>feature node</strong></p>
                    <p>Lines coming from the left show which lower layer features influenced it.</p>
                    <p>Lines going to the right show which higher layer features it influenced. </p>
                    <p>The stronger the colour of a line, the greater the influence.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Node Connections",
            description: (
                <div>
                    <p>Here we have a better view of which features our selected node received influence from, and which features it influenced. </p>
                    <p>They are sorted by strength of influence.</p>
                    <p>The label of our selected feature is also there at the top.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.node-connections') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Feature Details",
            description: (
                <div>
                    <p>Here we have some metrics of the selected node.</p>
                    <Space />
                    <p>Negative logits - The output tokens this feature least strongly promotes</p>
                    <p>Positive logits - The output tokens this feature most strongly promotes</p>
                    <p>Activation Density - Out of all the tokens in our test dataset, what % of them caused this feature to fire</p>
                    <p>Top Graph - Histogram of how strongly the feature fired when it did fire.</p>
                    <p>Bottom Graph - Histogram of how much this feature contributed to each token in the model's vocabulary</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.feature-details') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Feature Details",
            description: (
                <div>
                    <p>Below are the activations of the selected node. </p>
                    <p>These are the contexts that caused this node to activate the most strongly. They are from real text that the model has processed.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.feature-details') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Feature Details",
            description: (
                <div>
                    <p>These activations are what is used to derive the label of the node. In fact, they are passed to an auto interpret LLM which reads through all the contexts, extract common pattern, and returns a human-readable label.</p>
                    <FeatureDetails />
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.feature-details') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Subgraph",
            description: (
                <div>
                    <p>Among all the features that are present in the attribution graph, not all of them have significantly influenced the output. </p>
                    <Space />
                    <p>To focus on the important features, We manually pick out the nodes that have contributed significantly.</p>
                    <Space />
                    <p>This forms the subgraph which would be displayed here.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.subgraph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Now lets do an example",
            description: "We start from the most probable output, since we are trying to trace backwards and find out who contributed most to it.",
            arrow: true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Add most probable output to subgraph",
            description: (
                <div>
                    <p><Token token="Ctrl" /> + <Token token="Click" /> the most probable output (top right output node) to add it to the subgraph.</p>
                    <Space />
                    <p><Token token="Click" /> on it again so we can see the input features of the output node.</p>
                    <div className="w-full flex justify-center">
                        <img
                            src={LinkGraphGif.src}
                            alt="LinkGraphGif"
                            className="w-[30%] rounded-lg"
                        />
                    </div>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.link-graph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Choose 3 input features",
            description: (
                <div>
                    <p>We then pick the top 3 inputs <strong>features</strong> that influenced it and add them to the subgraph using <Token token="Ctrl" /> + <Token token="Click" />.</p>
                    <div className="w-full flex justify-center">
                        <img
                            src={NodeConnectionsGif.src}
                            alt="NodeConnectionsGif"
                            className="w-[70%]"
                            style={{ clipPath: "inset(0 5px 0 5px)" }}
                        />
                    </div>
                    <p>3 is chosen simply for demonstration purposes, you are allowed to choose any number you like.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.node-connections') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Choose 3 more inputs each",
            description: (
                <div>
                    <p>For each of the 3 inputs chosen, add another 3 more inputs for it.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.top-section') as HTMLElement,
            placement: "bottom",
        },
        {
            title: "Repeat this process",
            description: (
                <div>
                    <p>Repeat this process 1 more times.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.top-section') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Grouping",
            description: (
                <div>
                    <p>By now you should notice there are many nodes with similar labels</p>
                    <p>For example <strong>"Texas", "Texas legal documents"</strong></p>
                    <Space />
                    <p>We can group the related nodes to make the subgraph easier to read</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.subgraph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Grouping",
            description: (
                <div>
                    <p>Hold <Token token="g" /> and click the nodes you want to group.</p>
                    <p>Releasing <Token token="g" /> creates the <strong>supernode</strong>.</p>
                    <Space />
                    <p><Token token="Double-click" /> a supernode's label to rename it.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.subgraph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Result",
            description: (
                <div>
                    <p>If you have been following along, your subgraph should contain nodes representing <Token token="Austin" />, <Token token="Texas" />, <Token token="capital" />, <Token token="cities" />, <Token token="state" />.</p>
                    <Space />
                    <p>This shows that the model reasoned:</p>
                    <p>1. <Token token="capital" /> in this context represent a city capital, not financial capital</p>
                    <p> 2. <Token token="state" /> refers to a US state, not the verb "to state".</p>
                    <p>3. <Token token="Texas" /> is the state containing Dallas</p>
                    <p>4. <Token token="Austin" /> is the capital of <Token token="Texas" />, and therefore the answer.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.subgraph') as HTMLElement,
            placement: "bottom"
        },
        {
            title: "Congratulations",
            description: (
                <div>
                    <p>You have now learned how to use the circuit tracer!</p>
                    <Space />
                    <p>A few things to keep in mind as you explore on your own:</p>
                    <p>- There is no strict rule on how many input nodes to add at each step. Use your judgment based on what seems most relevant to the model's reasoning.</p>
                    <p>- If you want to replay this tutorial at any time, click the <strong>Tutorial</strong> button in the toolbar.</p>
                    <div className="w-full flex flex-col items-center">
                        <img
                            src={Tutorial.src}
                            alt="Tutorial"
                            className="w-[50%]"
                        />
                    </div>
                    <Space />
                    <p>We can now explore other additional features.</p>
                </div>
            ),
            arrow: true,
            placement: "center"
        },
        {
            title: "Steer",
            description: (
                <div>
                    <p>Steering lets you modify the models's behavior by directly amplifying or suppressing specific features you have pinned in the subgraph.</p>
                    <Space />
                    <p>Think of it as surgically changing the way the model thinks.</p>
                    <p>Instead of prompting it differently, you are directly intervening on its internal activations and observing how the output changes.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.steer-button') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Steer",
            description: (
                <div>
                    <p>For example, amplifying the <Token token="Texas" /> feature may make the model more likely to produce Texas-related outputs, while suppressing it may cause it to reason differently entirely.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.steer-button') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Auto Generate",
            description: (
                <div>
                    <p>This feature attempts to automate the building and labelling of the subgraph.</p>
                    <Space />
                    <p>Starting from an output node, it repeatedly adds the top-k input nodes of the current node into a queue, expanding outward to form a large temporary subgraph.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.auto-generate-button') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Auto Generate",
            description: (
                <div>
                    <p>Each node's finalised label is determined by a vote among its connected nodes.</p>
                    <p>The embedding of each node's finalised label is then compared against the candidate labels of its child nodes using cosine similarity.</p>
                    <p>The top-k candidates above a minimum similarity threshold receive a vote.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.auto-generate-button') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Auto Generate",
            description: (
                <div>
                    <p>Nodes that neither received votes nor cast votes are pruned from the subgraph.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.auto-generate-button') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Auto Generate",
            description: (
                <div>
                    <p>Finally, the remaining nodes are grouped using agglomerative clustering on their label embeddings, automatically forming supernodes for semantically related concepts.</p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.auto-generate-button') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
        {
            title: "Speed Add",
            description: (
                <div>
                    <p>
                        This feature adds all nodes whose labels contain any of the user-specified keywords as a substring.
                    </p>
                    <p>
                        {`For example, entering "Texas" would add all nodes whose label contains the word \"Texas\"`}.
                    </p>
                </div>
            ),
            arrow: true,
            target: () => document.querySelector('.speed-add-button') as HTMLElement,
            placement: "leftBottom",
            styles: {
                root: { transform: 'translateY(-200px)' }
            }
        },
    ];

    const handleClose = () => {
        setIsTutorialModalOpen(false);
        localStorage.setItem('circuit-tracer-tour-seen', 'true')
    };

    return (
        <Tour
            open={isTutorialModalOpen}
            onClose={handleClose}
            onFinish={handleClose}
            indicatorsRender={(current, total) => (
                <span className="text-xs text-slate-400">{current + 1} / {total}</span>
            )}
            steps={steps}
            styles={{
                section: { width: 'min(600px, 90vw)' },
            }}
        />
    )
}