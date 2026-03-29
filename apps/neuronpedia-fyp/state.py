from sentence_transformers import SentenceTransformer
import psycopg2.pool

db_pool: psycopg2.pool.ThreadedConnectionPool | None = None
sentence_model: SentenceTransformer | None = None