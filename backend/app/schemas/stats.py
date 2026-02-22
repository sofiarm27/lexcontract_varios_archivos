from pydantic import BaseModel

class StatsSchema(BaseModel):
    firmStats: dict
    userStats: dict
