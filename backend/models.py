from typing import Annotated, Optional
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


PyObjectId = Annotated[str, BeforeValidator(str)]

class Suscripcion(BaseModel):
    cliente: str
    plan: str
    valor_mensual: float
    activa: bool = True

class SuscripcionDB(Suscripcion):
    id: PyObjectId = Field(alias="_id")
    model_config = ConfigDict(populate_by_name=True)

class SuscripcionUpdate(BaseModel):
    cliente: Optional[str] = None
    plan: Optional[str] = None
    valor_mensual: Optional[float] = None
    activa: Optional[bool] = None