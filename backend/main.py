from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid

import models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API")

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/todos/", response_model=schemas.TodoOut)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    new_id = str(uuid.uuid4())
    db_todo = models.Todo(id=new_id, task=todo.task, completed=False)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.get("/todos/", response_model=List[schemas.TodoOut])
def read_todos(db: Session = Depends(get_db)):
    return db.query(models.Todo).all()

@app.put("/todos/{todo_id}", response_model=schemas.TodoOut)
def update_todo(todo_id: str, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    t = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Todo not found")
    if todo.task is not None:
        t.task = todo.task
    if todo.completed is not None:
        t.completed = todo.completed
    db.commit()
    db.refresh(t)
    return t

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: str, db: Session = Depends(get_db)):
    t = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(t)
    db.commit()
    return {"ok": True}
