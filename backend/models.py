from sqlalchemy import Column, String, Boolean
from database import Base

class Todo(Base):
    __tablename__ = "todos"
    id = Column(String, primary_key=True, index=True)
    task = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
