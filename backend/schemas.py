from pydantic import BaseModel
from typing import Optional

class TodoBase(BaseModel):
    task: str

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    task: Optional[str] = None
    completed: Optional[bool] = None

class TodoOut(TodoBase):
    id: str
    completed: bool

    class Config:
        orm_mode = True
