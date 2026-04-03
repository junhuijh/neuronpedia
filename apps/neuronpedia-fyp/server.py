import os
from collections.abc import Awaitable, Callable

import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")


from autogenerate import (
    AutoGenerateRequest,
    generate_auto_generate,
)
from seeds import (
    SeedsRequest,
    generate_seeds
)
from filter import (
    FilterRequest,
    generate_filter,
)
from cluster import (
    ClusterRequest,
    generate_cluster,
)
from captcha import (
    VerifyTurnstileRequest,
    SaveCaptchaRequest,
    VerifyCaptchaRequest,
    generate_verify_turnstile,
    generate_random_feature,
    generate_save_captcha,
    generate_verify_captcha
)


import psycopg2
import state
from contextlib import asynccontextmanager

VERSION_PREFIX_PATH = "/fyp"
router = APIRouter(prefix=VERSION_PREFIX_PATH)

# Load environment variables from .env file
load_dotenv()
SECRET = os.getenv("SECRET")
DATABSE_URL = os.getenv("POSTGRES_URL_NON_POOLING")

# def initialize_globals():
#     print("initializing globals")
#     global model
#     if torch.cuda.is_available():
#         model = SentenceTransformer(
#             "dunzhang/stella_en_400M_v5",
#             trust_remote_code=True,  # type: ignore[call-arg]
#         ).cuda()
#         print("initialized embedding model")
#     else:
#         print("no cuda available, not initializing embedding model")

@router.post("/auto_generate")
async def auto_generate_endpoint(request: AutoGenerateRequest):
    print("Auto Generate Called")
    return await generate_auto_generate(request)

@router.post("/seeds")
async def verify_captcha_endpoint(request: SeedsRequest):
    print("Seeds Called")
    return await generate_seeds(request)

@router.post("/filter")
async def auto_generate_endpoint(request: FilterRequest):
    print("Filter Called")
    return await generate_filter(request)

@router.post("/cluster")
async def cluster_endpoint(request: ClusterRequest):
    print("Cluster Called")
    return await generate_cluster(request)



@router.post("/verify_turnstile")
async def verify_turnstile_endpoint(request: VerifyTurnstileRequest):
    print("Verify Turnstile Called")
    return await generate_verify_turnstile(request)

@router.get("/random_feature")
async def random_feature_endpoint():
    print("Random Feature Called")
    return await generate_random_feature()

@router.post("/save_captcha")
async def save_captcha_endpoint(request: SaveCaptchaRequest):
    print("Save Captcha Called")
    return await generate_save_captcha(request)

@router.post("/verify_captcha")
async def verify_captcha_endpoint(request: VerifyCaptchaRequest):
    print("Verify Captcha Called")
    return await generate_verify_captcha(request)





@asynccontextmanager
async def lifespan(app: FastAPI):
    state.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
    state.db_pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=2,
        maxconn=10,
        dsn=DATABSE_URL
    )
    yield
    state.db_pool.closeall()


app = FastAPI(lifespan=lifespan)
app.include_router(router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.on_event("startup")  # type: ignore[deprecated]
# async def startup_event():
#     initialize_globals()


@app.middleware("http")
async def check_secret_key(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    # if we didn't specify a secret, then just allow the request through
    if SECRET is None:
        return await call_next(request)
    secret_key = request.headers.get("X-SECRET-KEY")
    if not secret_key or secret_key != SECRET:
        return JSONResponse(
            status_code=401,
            content={
                "error": "Invalid secret in X-SECRET-KEY header. Check that it matches the SECRET set in the server .env file."
            },
        )
    response = await call_next(request)
    return response  # noqa: RET504


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5010)
