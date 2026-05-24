from pydantic import BaseModel

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str

class ExpenseResponse(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True

class ExpenseUpdate(BaseModel):
    title: str
    amount: float
    category: str

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True