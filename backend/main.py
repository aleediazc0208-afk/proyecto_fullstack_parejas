from bson import ObjectId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import coleccion
from models import Suscripcion, SuscripcionDB, SuscripcionUpdate

app = FastAPI(title="Iron Fitness API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def valid_id(id: str) -> ObjectId:
    if not ObjectId.is_valid(id):
        raise HTTPException(400, "ID inválido")
    return ObjectId(id)

@app.get("/membresias", response_model=list[SuscripcionDB])
async def listar():
    return await coleccion.find().to_list(1000)

@app.post("/membresias", response_model=SuscripcionDB, status_code=201)
async def crear(s: Suscripcion):
    res = await coleccion.insert_one(s.model_dump())
    return await coleccion.find_one({"_id": res.inserted_id})

@app.put("/membresias/{id}", response_model=SuscripcionDB)
async def actualizar(id: str, datos: SuscripcionUpdate):
    cambios = datos.model_dump(exclude_unset=True)
    if not cambios:
        raise HTTPException(400, "Sin datos")
    res = await coleccion.update_one({"_id": valid_id(id)}, {"$set": cambios})
    if res.matched_count == 0:
        raise HTTPException(404, "No encontrado")
    return await coleccion.find_one({"_id": valid_id(id)})

@app.delete("/membresias/{id}")
async def eliminar(id: str):
    res = await coleccion.delete_one({"_id": valid_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(404, "No encontrado")
    return {"mensaje": "Eliminado"}