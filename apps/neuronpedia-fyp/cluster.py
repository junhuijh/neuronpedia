import numpy as np
from fastapi import HTTPException
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
import state
import traceback
import json

class ClusterRequest(BaseModel):
    layerCtxMap: dict[str,list[int]]

class ClusterResponse(BaseModel):
    clusters: dict[str, list[list[int]]]

async def generate_cluster(request: ClusterRequest):
    try:
        # Make an array of (layer, index) tuples
        layer_index_tuples = []
        keys = request.layerCtxMap.keys()
        for key in keys:
            # Get the layer
            layer = key.split("_")[0]
            for index in request.layerCtxMap[key]:
                layer_index_tuples.append((str(layer), str(index)))
        # Fetch all embeddings in one query using pool
        def fetch_embeddings():
            conn = state.db_pool.getconn()
            try:
                cur = conn.cursor()
                cur.execute(
                    """
                    SELECT layer, index, embedding
                    FROM "Explanation"
                    WHERE (layer::text, "index"::text) IN %s;
                    """,
                    (tuple(layer_index_tuples),)
                )
                rows = cur.fetchall()
                cur.close()
                return rows
            finally:
                state.db_pool.putconn(conn)
        # Huge call. Run in threadpool so we dont block others
        rows = await run_in_threadpool(fetch_embeddings)
        layerIndexEmbeddingMap = {}
        for layer, index, embedding in rows:
            layer = str(layer)
            index = str(index)
            if layer not in layerIndexEmbeddingMap:
                layerIndexEmbeddingMap[layer] = {}
            layerIndexEmbeddingMap[layer][index] = json.loads(embedding)

        for key, indexes in request.layerCtxMap.items():
            layer = key.split("_")[0]
            # Get embeddings
            valid_indexes = [i for i in indexes if str(i) in layerIndexEmbeddingMap.get(layer, {})]
            if len(valid_indexes) < 2:
                # Cannot cluster since less than 2
                request.layerCtxMap[key] = [valid_indexes] if valid_indexes else []
                continue
            embeddings = [layerIndexEmbeddingMap[layer][str(i)] for i in valid_indexes]
            # print(f"valid_indexes: {len(valid_indexes)}, embeddings shape: {embeddings.shape}")
            embeddings = np.array(embeddings)
            clustering = AgglomerativeClustering(
                n_clusters=None,
                distance_threshold=1-0.8,
                metric='cosine',
                linkage='average'
            )
            labels = clustering.fit_predict(embeddings)
            label_map = {}
            for index in range(len(labels)):
                group = labels[index]
                if group in label_map:
                    label_map[group].append(indexes[index])
                else:
                    label_map[group] = [indexes[index]]
            request.layerCtxMap[key] = list(label_map.values())
        
        return ClusterResponse(clusters=request.layerCtxMap)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))