import httpx
import os
import uuid
from datetime import datetime, timedelta
from pydantic import BaseModel
import state

class VerifyTurnstileRequest(BaseModel):
    token: str

class VerifyTurnstileResponse(BaseModel):
    success: bool

class Activation(BaseModel):
    tokens: list[str]
    maxValueTokenIndex: int
    values: list[float]

class RandomFeatureResponse(BaseModel):
    modelId: str
    layer: str
    index: str
    logits: list[str]
    activations:list[Activation]

class SaveCaptchaRequest(BaseModel):
    modelId: str
    layer: str
    index: str
    logits_answer: str | None
    activations_type: str | None
    activations_answer: str | None

class SaveCaptchaResponse(BaseModel):
    token:str

class VerifyCaptchaRequest(BaseModel):
    token:str

class VerifyCaptchaResponse(BaseModel):
    success:bool

def fix_encoding(token: str):
    # Attempts to fix weird encoding
    try:
        return token.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return token

def clean_tokens(tokens: list[str]):
    return [
        fix_encoding(token)
        .replace("▁", " ")
        .replace("Ċ", " ")
        .replace("ĉ", " ")
        .replace("Ġ", " ")
        .replace("\n", " ")
        .replace("<0x0A>", " ")
        for token in tokens
    ]
async def generate_verify_turnstile(request: VerifyTurnstileRequest):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": os.getenv("CLOUDFLAREPRIVATEKEY"),
                "response": request.token
            }
        )
        return VerifyTurnstileResponse(success=res.json()["success"])

async def generate_random_feature():
    conn = state.db_pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT "modelId", layer, index, "pos_str", "pos_values"
            FROM "Neuron"
            ORDER BY RANDOM()
            LIMIT 1
            """
        )
        neuron = cur.fetchone()
        model_id, layer, index, pos_str, pos_values = neuron
        logits = sorted(pos_str, key=lambda s: pos_values[pos_str.index(s)], reverse=True)
        cur.execute(
            """
            SELECT tokens, "maxValueTokenIndex", values
            FROM (
                SELECT tokens, "maxValueTokenIndex", values
                FROM "Activation"
                WHERE "modelId" = %s AND layer = %s AND index = %s
                ORDER BY "maxValue" DESC
                LIMIT 20
            ) top20
            ORDER BY RANDOM()
            LIMIT 5
            """,
            (model_id, layer, index),
        )
        activations = cur.fetchall()

        cur.close()
        return RandomFeatureResponse(
            modelId=model_id,
            layer=layer,
            index=index,
            logits=logits,
            activations=[
                Activation(
                    tokens=clean_tokens(row[0]),
                    maxValueTokenIndex=row[1],
                    values=row[2],
                ) for row in activations
            ],
        )
    finally:
        state.db_pool.putconn(conn)

async def generate_save_captcha(request:SaveCaptchaRequest):
    conn = state.db_pool.getconn()
    try:
        # Save data in db
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO "Captcha" ("modelId", layer, index, "logitsAnswer", "activationsType", "activationsAnswer")
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (request.modelId, request.layer, request.index, request.logits_answer, request.activations_type, request.activations_answer),
        )
        conn.commit()
        captcha_id = cur.fetchone()[0]

        # Generate random token
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        # Save token
        cur.execute(
            """
            INSERT INTO "CaptchaToken" (token, "captchaId", "expiresAt")
            VALUES (%s, %s, %s)
            """,
            (token, captcha_id, expires_at),
        )
        conn.commit()
        cur.close()
        # Return token
        return SaveCaptchaResponse(token=token)
    finally:
        state.db_pool.putconn(conn)

async def generate_verify_captcha(request: VerifyCaptchaRequest):
    conn = state.db_pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT token FROM "CaptchaToken"
            WHERE token = %s AND "expiresAt" > NOW()
            """,
            (request.token,),
        )
        row = cur.fetchone()
        if row is None:
            return VerifyCaptchaResponse(valid=False)
        # Delete token
        cur.execute(
            """
            DELETE FROM "CaptchaToken"
            WHERE token = %s
            """,
            (request.token,),
        )
        conn.commit()
        cur.close()
        return VerifyCaptchaResponse(valid=True)
    finally:
        state.db_pool.putconn(conn)