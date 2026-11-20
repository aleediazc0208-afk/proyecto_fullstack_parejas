import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("DATABASE_NAME", "adso_db")]
coleccion = db["membresias"]
