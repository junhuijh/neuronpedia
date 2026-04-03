import httpx
import os
from fastapi import HTTPException
from pydantic import BaseModel
import dotenv
dotenv.load_dotenv()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_KEY")
class SeedsRequest(BaseModel):
    prompt: str
class SeedsResponse(BaseModel):
    seeds: list[str]

async def generate_seeds(request: SeedsRequest):
    try:
        prompt = request.prompt
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [{
                        "role": "user",
                        "content": f"Given this incomplete sentence: '{prompt}', list the key concepts related to the question and the answer needed to complete it. Include proper nouns, locations, people, and related terms. Return only a comma separated list, nothing else."
                    }]
                }
            )
            data = response.json()
            if "error" in data:
                print(data)
            seeds = data["choices"][0]["message"]["content"].split(",")
            print(seeds)
            return SeedsResponse(seeds=[seed.strip() for seed in seeds])
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))