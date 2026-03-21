import psycopg2.pool

pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, pool
    model = SentenceTransformer('all-MiniLM-L6-v2')
    pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=2,
        maxconn=10,
        dbname="your_db",
        user="your_user",
        password="your_password",
        host="localhost",
        port=5432
    )
    yield
    pool.closeall()

app = FastAPI(lifespan=lifespan)