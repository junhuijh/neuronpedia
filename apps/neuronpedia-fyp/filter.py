from fastapi import HTTPException
from pydantic import BaseModel
import state


MIN_SIMILARITY = 0.5

class Neuron(BaseModel):
    layer: str
    id: str

class FilterRequest(BaseModel):
    filters: list[str]

class FilterResponse(BaseModel):
    filtered : list[Neuron]

async def generate_filter(request: FilterRequest):
    conn = state.db_pool.getconn()
    try:
        all_neurons = []

        for filter_term in request.filters:
            embedding = state.sentence_model.encode(filter_term).tolist()

            cur = conn.cursor()
            cur.execute("""
                            SELECT e.layer, e.index, e.description,
                                1 - (de.embedding <=> %s::vector) as similarity
                            FROM "DescriptionEmbedding" de
                            JOIN "Explanation" e ON de."explanationId" = e.id
                            WHERE e."modelId" = 'gemma-2-2b'
                            AND 1 - (de.embedding <=> %s::vector) > %s
                            ORDER BY de.embedding <=> %s::vector
                        """, 
                        (embedding, embedding, MIN_SIMILARITY, embedding))

            rows = cur.fetchall()
            cur.close()

            for row in rows:
                all_neurons.append(Neuron(layer=row[0], id=row[1]))

        seen = set()
        unique_neurons = []
        for n in all_neurons:
            key = (n.layer, n.id)
            if key not in seen:
                seen.add(key)
                unique_neurons.append(n)

        return FilterResponse(filtered=unique_neurons)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        state.db_pool.putconn(conn)