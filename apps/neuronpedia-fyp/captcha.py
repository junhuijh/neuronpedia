import httpx
import os

async def verify_turnstile(token: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": os.getenv("CLOUDFLAREPRIVATEKEY"),
                "response": token
            }
        )
        return res.json()["success"]