from fastapi import FastAPI

app = FastAPI(
    title="Chispita API",
    description="Backend para el Centro de Comando",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"status": "ok", "mensaje": "Servidor de Yescas jalando al cien."}

@app.get("/ping")
def ping():
    return {"ping": "pong"}