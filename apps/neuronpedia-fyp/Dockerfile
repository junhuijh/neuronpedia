FROM python:3.12.3-slim

WORKDIR /app

ARG OPENROUTER_API
ENV OPENROUTER_API=$OPENROUTER_API

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5010

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "5010"]