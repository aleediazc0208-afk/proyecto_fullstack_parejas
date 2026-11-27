from typing import Annotated, Optional
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


PyObjectId = Annotated[str, BeforeValidator(str)]

class Suscripcion(BaseModel):
    cliente: str = Field(..., min_length=2)
    plan: str
    valor_mensual: float = Field(..., gt=0)
    activa: bool = True
    imagen_url: str = Field(..., description="URL pública de la imagen del socio")

class SuscripcionDB(Suscripcion):
    id: PyObjectId = Field(alias="_id")
    model_config = ConfigDict(populate_by_name=True)

class SuscripcionUpdate(BaseModel):
    cliente: Optional[str] = None
    plan: Optional[str] = None
    valor_mensual: Optional[float] = None
    activa: Optional[bool] = None
    imagen_url: Optional[str] = None