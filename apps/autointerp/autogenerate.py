import re

import numpy as np
from fastapi import HTTPException
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
from pydantic import BaseModel

model = SentenceTransformer('all-MiniLM-L6-v2')

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

class AutoGenerateResponse(BaseModel):
    final_pinned:list[GraphNode]
    final_pinned_ids: list[str]
    groups: list[list[str]]
    group_names: list[str]

# async def generate_auto_generate(request: AutoGenerateRequest):
#     try:
#         total = len(request.newPinned.values())
#         top_k = 2
#         min_similarity_vote = 0.65
        
#         visited = set()
#         queue = [n for n in request.newPinned.values() if n.inDegree == 0 and n.feature_type != "logit"]

#         while len(queue) > 0:
#             node = queue.pop(0)
#             if node.node_id in visited:
#                 print("Node has been visited!")
#                 continue
#             if node.inDegree > 0:
#                 print("Node has in degree > 0!")
#                 queue.append(node)
#                 continue
#             visited.add(node.node_id)
#             # If not output and embedding node, finalise name
#             if node.feature_type != "logit" and node.feature_type!="embedding":
#                 if len(node.votes) == 0:
#                     # No explanations given by autointerp
#                     # Just set final name as description
#                     if node.description != "":
#                         node.final_name = node.description
#                     else:
#                         print("Node doesnt have description or explanation?")
#                         print(node)
#                         continue
#                 else:
#                     # Has votes
#                     node.final_name = max(node.votes, key=node.votes.get)

#             # Vote parent's name
#             if node.feature_type == "embedding":
#                 # Just vote all
#                 # Reasoning is due to embeddings being unable to vote
#                 # if min_similarity_vote is too high
#                 for parent_node_id in node.parent_ids:
#                     parent_node = request.newPinned.get(parent_node_id)
#                     if not parent_node:
#                         continue
#                     for vote in parent_node.votes:
#                         parent_node.votes[vote] += 1
#                     parent_node.inDegree -= 1
#             else:
#                 for parent_node_id in node.parent_ids:
#                     parent_node = request.newPinned.get(parent_node_id)
#                     if not parent_node:
#                         print("Parent not found?")
#                         continue
#                     if parent_node.feature_type == "logit":
#                         # Dont need to vote for output node's name
#                         continue
#                     if not node.final_name:
#                         parent_node.inDegree -= 1
#                         print("Node has no final name!")
#                         continue
#                     if parent_node.explanations:
#                         match = re.match(r'Say "(\s*)"', node.final_name)
#                         if match:
#                             final_name = match.group(1).strip() or node.final_name
#                         else:
#                             final_name = node.final_name
#                         all_texts = [final_name] + parent_node.explanations
#                         embeddings = model.encode(all_texts)
#                         voter_embeddings = embeddings[:1]
#                         candidates_embeddings = embeddings[1:]
#                         scores = cosine_similarity(voter_embeddings, candidates_embeddings).mean(axis=1)
#                         top_k_indices = np.argsort(scores)[::-1][:top_k]
#                         votes = [parent_node.explanations[i] for i in top_k_indices if scores[i] >= min_similarity_vote]
#                         for vote in votes:
#                             parent_node.votes[vote] += 1
#                         node.votes_casted += len(votes)
#                         parent_node.inDegree -= 1

#                     if parent_node.inDegree == 0 and parent_node.node_id not in visited:
#                         queue.append(parent_node)
#             print(f"{len(visited)}/{total}")


#         # Prune those that didnt vote or didnt get votes
#         simple_words = ["the","it","he","she", "is", "are", "were"]
#         to_prune = [
#             node.node_id for node in request.newPinned.values()
#             if sum(node.votes.values()) == 0 and node.votes_casted == 0 
#             and node.feature_type not in ("embedding", "logit")
#             or node.final_name.lower() in simple_words
#             or node.description.lower() in simple_words
#         ]
#         print(f"Pruned {len(to_prune)}")
#         for node_id in to_prune:
#             request.newPinned.pop(node_id)

#         # Now group them 
#         min_similarity_group = 0.9
#         outer_nodes = [n for n in request.newPinned.values() if n.feature_type in ("embedding", "logit")]
#         between_nodes = [n for n in request.newPinned.values() if n.feature_type not in ("embedding", "logit")]
#         node_names_list = [n.final_name for n in between_nodes]

#         embeddings = model.encode(node_names_list)
#         clustering = AgglomerativeClustering(
#             n_clusters=None,
#             distance_threshold=1 - min_similarity_group,
#             metric='cosine',
#             linkage='average'
#         )
#         cluster_ids = clustering.fit_predict(embeddings)

#         groups: list[list[str]] = []
#         group_names: list[str] = []
#         for i, cluster_id in enumerate(cluster_ids):
#             while len(groups) <= cluster_id:
#                 groups.append([])
#             groups[cluster_id].append(between_nodes[i].node_id)
#         groups = [g for g in groups if len(g) > 1]
        
#         group_names = []
#         for group in groups:
#             best_node = max(
#                 (request.newPinned[node_id] for node_id in group),
#                 key=lambda n: sum(n.votes.values())
#             )
#             group_names.append(best_node.final_name)

#         final_pinned_ids = [n.node_id for n in request.newPinned.values()]
#         print(f"Pinned: {len(final_pinned_ids)}")
#         print(f"Groups: {len(groups)}")
#         return AutoGenerateResponse(
#             groups=groups,
#             group_names = group_names,
#             final_pinned_ids = final_pinned_ids, 
#             final_pinned=list(request.newPinned.values())

#         )
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

async def generate_auto_generate(request: AutoGenerateRequest):
    try:
        total = len(request.newPinned.values())
        top_k = 2
        min_similarity_vote = 0.65
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
            voter_embedding = model.encode([final_name])

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
                    candidates_embeddings = model.encode(child_node.explanations)
                    scores = cosine_similarity(voter_embedding, candidates_embeddings).mean(axis=1)
                    top_k_indices = np.argsort(scores)[::-1][:top_k]
                    votes = [child_node.explanations[i] for i in top_k_indices if scores[i] >= min_similarity_vote]
                    for vote in votes:
                        child_node.votes[vote] += 1
                    node.votes_casted += len(votes)
                child_node.inDegree -= 1

                if child_node.inDegree == 0 and child_node.node_id not in visited:
                    queue.append(child_node)
            print(f"{len(visited)}/{total}")


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

        # Now group them 
        min_similarity_group = 0.8
        between_nodes = [n for n in request.newPinned.values() if n.feature_type not in ("embedding", "logit")]
        node_names_list = [n.final_name for n in between_nodes]

        embeddings = model.encode(node_names_list)
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