from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from sqlalchemy import func

from app import models, schemas
from app.database import SessionLocal, engine

from app.auth import (
    hash_password,
    verify_password,
    create_access_token
)

from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import (
    oauth2_scheme,
    verify_token
)
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    username = verify_token(token)

    if username is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return username

# Root
@app.get("/")
def home():
    return {"message": "Expense Tracker API"}

# Create Expense
@app.post("/expenses/",
          response_model=schemas.ExpenseResponse)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    user = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    new_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        owner_id=user.id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense

# Get All Expenses
@app.get("/expenses/",
         response_model=list[schemas.ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    user = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    expenses = db.query(models.Expense).filter(
        models.Expense.owner_id == user.id
    ).all()

    return expenses


@app.get("/expenses/summary")
def expense_summary(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    user = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    total = db.query(
        func.sum(models.Expense.amount)
    ).filter(
        models.Expense.owner_id == user.id
    ).scalar()

    return {
        "total_expenses": total or 0
    }

@app.get("/expenses/category-summary")
def category_summary(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    user = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    summary = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label("total")
    ).filter(
        models.Expense.owner_id == user.id
    ).group_by(
        models.Expense.category
    ).all()

    return [
        {
            "category": item[0],
            "total": item[1]
        }
        for item in summary
    ]

@app.get("/expenses/filter")
def filter_expenses(
    category: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    user = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    expenses = db.query(models.Expense).filter(
        models.Expense.owner_id == user.id,
        models.Expense.category == category
    ).all()

    return expenses

@app.get("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
def get_expense(
    expense_id: int, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    return expense


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    db.delete(expense)
    db.commit()

    return {"message": "Expense deleted"}
# @app.delete("/expenses/{expense_id}")
# def delete_expense(
#     expense_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user)
# ):
#     expense = db.query(models.Expense).filter(
#         models.Expense.id == expense_id,
#         models.Expense.owner_id == current_user.id
#     ).first()

#     if not expense:
#         raise HTTPException(status_code=404, detail="Expense not found")

#     db.delete(expense)
#     db.commit()

#     return {"message": "Expense deleted"}


@app.put("/expenses/{expense_id}",
         response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: int,
    updated_expense: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    user = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.owner_id == user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    expense.title = updated_expense.title
    expense.amount = updated_expense.amount
    expense.category = updated_expense.category

    db.commit()
    db.refresh(expense)

    return expense

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate,
           db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_pw = hash_password(user.password)

    new_user = models.User(
        username=user.username,
        password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username"
        )

    if not verify_password(
        form_data.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {"sub": existing_user.username}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }