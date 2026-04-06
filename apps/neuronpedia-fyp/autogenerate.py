import re

import numpy as np
from fastapi import HTTPException
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
from pydantic import BaseModel
import state

class GraphNode(BaseModel):
    node_id: str
    feature_id:str
    feature_type: str
    description: str
    explanations: list[str] | None
    inDegree: int
    child_ids: list[str]
    votes: dict[str, int]
    votes_casted: int
    final_name: str
    

class AutoGenerateRequest(BaseModel):
    newPinned: dict[str, GraphNode]
    max_votes_per_node: int
    min_similarity_vote: float
    min_similarity_group: float

class AutoGenerateResponse(BaseModel):
    final_pinned:list[GraphNode]
    final_pinned_ids: list[str]
    groups: list[list[str]]
    group_names: list[str]

async def generate_auto_generate(request: AutoGenerateRequest):
    # Max number of subgraph nodes to prevent crashing
    MAX_SUBGRAPH_NODES = 150
    try:
        total = len(request.newPinned.values())
        print(f"Total: {total}")
        max_votes_per_node = request.max_votes_per_node
        min_similarity_vote = request.min_similarity_vote
        min_similarity_group = request.min_similarity_group
        to_prune = []
        
        visited = set()
        queue = [n for n in request.newPinned.values() if n.feature_type == "logit"]

        while len(queue) > 0:
            node = queue.pop(0)
            if node.node_id in visited:
                print("Node has been visited!")
                continue
            if node.inDegree > 0:
                print("Node has in degree > 0!")
                queue.append(node)
                continue
            visited.add(node.node_id)
            # If not output and embedding node, finalise name
            if node.feature_type != "logit" and node.feature_type!="embedding":
                if len(node.votes) == 0:
                    # No explanations given by autointerp
                    # Just set final name as description
                    if node.description != "":
                        node.final_name = node.description
                    else:
                        print("Node doesnt have description or explanation?")
                        print(node)
                        continue
                else:
                    # Has votes
                    node.final_name = max(node.votes, key=node.votes.get)

            # If final_name isnt really useful, prune it off
            simple_words = ["the","it","he","she", "is", "are", "were", "of"]
            say_match = re.match(r'Say "(.+)"', node.final_name)
            if say_match:
                final_name = say_match.group(1).strip() or node.final_name
            else:
                final_name = node.final_name
            if final_name.lower() in simple_words:
                to_prune.append(node.node_id)
                # Reduce children's inDegree as well
                for child_node_id in node.child_ids:
                    child_node = request.newPinned.get(child_node_id)
                    if not child_node:
                        print("child not found?")
                        continue
                    child_node.inDegree -= 1
                    if child_node.inDegree == 0 and child_node.node_id not in visited:
                        queue.append(child_node)
                continue

            # Vote child's name
            voter_embedding = state.sentence_model.encode([final_name])

            for child_node_id in node.child_ids:
                child_node = request.newPinned.get(child_node_id)
                if not child_node:
                    print("child not found?")
                    continue
                if child_node.feature_type == "embedding":
                    # Dont need to vote for embedding node's name
                    continue
                if not node.final_name:
                    child_node.inDegree -= 1
                    print("Node has no final name!")
                    continue
                if child_node.explanations:
                    candidates_embeddings = state.sentence_model.encode(child_node.explanations)
                    scores = cosine_similarity(voter_embedding, candidates_embeddings).mean(axis=1)
                    top_k_indices = np.argsort(scores)[::-1][:max_votes_per_node]
                    votes = [child_node.explanations[i] for i in top_k_indices if scores[i] >= min_similarity_vote]
                    for vote in votes:
                        child_node.votes[vote] += 1
                    node.votes_casted += len(votes)
                child_node.inDegree -= 1

                if child_node.inDegree == 0 and child_node.node_id not in visited:
                    queue.append(child_node)
            # print(f"{len(visited)}/{total}")


        # Prune those that didnt vote or didnt get votes
        
        to_prune += [
            node.node_id for node in request.newPinned.values()
            if node.feature_type not in ("embedding", "logit") and (
                (sum(node.votes.values()) == 0 and node.votes_casted == 0)
                or (node.final_name and node.final_name.lower() in simple_words)
                or (node.description and node.description.lower() in simple_words)
            )
        ]
        to_prune = list(set(to_prune))
        print(f"Pruned {len(to_prune)}")
        for node_id in to_prune:
            request.newPinned.pop(node_id)

        outer_nodes = {node_id: node for node_id, node in request.newPinned.items() if node.feature_type in ("logit", "embedding")}
        between_nodes = {node_id: node for node_id, node in request.newPinned.items() if node.feature_type not in ("logit", "embedding")}

        if len(between_nodes) > MAX_SUBGRAPH_NODES:
            sorted_between = sorted(
                between_nodes.values(),
                key=lambda node: sum(node.votes.values()),
                reverse=True
            )
            keep_ids = {node.node_id for node in sorted_between[:MAX_SUBGRAPH_NODES]}
            between_nodes = {node_id: node for node_id, node in between_nodes.items() if node_id in keep_ids}
            print(f"Capped to {MAX_SUBGRAPH_NODES + len(outer_nodes)} nodes")
            request.newPinned = {**outer_nodes, **between_nodes}

        # Now group them 
        between_nodes = [between_nodes.values()]
        if len(between_nodes)<=2:
            return AutoGenerateResponse(
                groups=[],
                group_names=[],
                final_pinned_ids=[n.node_id for n in request.newPinned.values()],
                final_pinned=list(request.newPinned.values())
            )
        node_names_list = [n.final_name for n in between_nodes]

        embeddings = state.sentence_model.encode(node_names_list)
        clustering = AgglomerativeClustering(
            n_clusters=None,
            distance_threshold=1 - min_similarity_group,
            metric='cosine',
            linkage='average'
        )
        cluster_ids = clustering.fit_predict(embeddings)

        groups: list[list[str]] = []
        group_names: list[str] = []
        for i, cluster_id in enumerate(cluster_ids):
            while len(groups) <= cluster_id:
                groups.append([])
            groups[cluster_id].append(between_nodes[i].node_id)
        groups = [g for g in groups if len(g) > 1]
        
        group_names = []
        for group in groups:
            best_node = max(
                (request.newPinned[node_id] for node_id in group),
                key=lambda n: sum(n.votes.values())
            )
            group_names.append(best_node.final_name)

        final_pinned_ids = [n.node_id for n in request.newPinned.values()]
        print(f"Pinned: {len(final_pinned_ids)}")
        print(f"Groups: {len(groups)}")
        return AutoGenerateResponse(
            groups=groups,
            group_names = group_names,
            final_pinned_ids = final_pinned_ids, 
            final_pinned=list(request.newPinned.values())
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))