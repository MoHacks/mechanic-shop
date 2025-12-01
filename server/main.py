from fastapi import FastAPI, WebSocket
from websocket_manager import manager
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from routers import tires, logs, threshold

app = FastAPI(title="Tire Inventory API")

# Enable CORS so your React app can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # adjust in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tires.router)
app.include_router(logs.router)
app.include_router(threshold.router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep connection open
    except:
        manager.disconnect(websocket)


# Optional: simple root route
@app.get("/")
def root():
    return {"message": "Tire Inventory API running!"}




'''
### THRESHOLD VALUE

# Simulated database (replace with real DB)
threshold_value = 10

class ThresholdModel(BaseModel):
    value: float

@app.get("/threshold")
def get_threshold():
    return {"value": threshold_value}

@app.put("/threshold")
def update_threshold(threshold: ThresholdModel):
    global threshold_value
    threshold_value = threshold.value
    return {"value": threshold_value}
'''





