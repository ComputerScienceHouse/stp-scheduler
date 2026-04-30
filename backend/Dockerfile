# Build from this directory: docker build -t stp-scheduler .
# Run: docker run -p 8000:8000 stp-scheduler

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["fastapi", "run", "app.py", "--host", "0.0.0.0", "--port", "8000"]
