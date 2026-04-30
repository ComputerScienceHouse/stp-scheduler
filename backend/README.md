# stp-scheduler

## Instructions

### Setup

```bash
pip install -r requirements.txt # setup environment
```

### Run dev

```bash
fastapi dev app.py
```

This hosts the API at localhost:8000

### Run Prod

```bash
fastapi run app.py
```

This hosts the API at localhost:8000

### Docker

From this directory (`backend/`):

```bash
docker build -t stp-scheduler .
docker run -p 8000:8000 stp-scheduler
```

The API is available at http://localhost:8000

If your shell is at the repository root instead, use:

```bash
docker build -f backend/Dockerfile -t stp-scheduler backend
docker run -p 8000:8000 stp-scheduler
```