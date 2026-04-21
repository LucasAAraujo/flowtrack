import uuid
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.category import Category
from app.models.time_entry import TimeEntry
from app.schemas.category import CategoryIn, CategoryUpdate, CategoryOut


def _get_or_404(db: Session, category_id: uuid.UUID, user_id: uuid.UUID) -> Category:
    cat = db.scalar(
        select(Category).where(Category.id == category_id, Category.user_id == user_id)
    )
    if cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail={"error": {"code": "NOT_FOUND", "message": "Categoria não encontrada"}})
    return cat


def _entry_count(db: Session, category_id: uuid.UUID) -> int:
    return db.scalar(select(func.count()).where(TimeEntry.category_id == category_id)) or 0


def _to_out(cat: Category, db: Session) -> CategoryOut:
    count = _entry_count(db, cat.id)
    return CategoryOut(
        id=cat.id,
        name=cat.name,
        color=cat.color,
        created_at=cat.created_at,
        entry_count=count,
    )


def create(db: Session, data: CategoryIn, user_id: uuid.UUID) -> CategoryOut:
    existing = db.scalar(
        select(Category).where(Category.user_id == user_id, Category.name == data.name)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "CONFLICT", "message": "Já existe uma categoria com este nome"}},
        )
    cat = Category(user_id=user_id, name=data.name, color=data.color)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return _to_out(cat, db)


def list_all(db: Session, user_id: uuid.UUID) -> list[CategoryOut]:
    cats = db.scalars(select(Category).where(Category.user_id == user_id)).all()
    return [_to_out(c, db) for c in cats]


def get_one(db: Session, category_id: uuid.UUID, user_id: uuid.UUID) -> CategoryOut:
    cat = _get_or_404(db, category_id, user_id)
    return _to_out(cat, db)


def update(db: Session, category_id: uuid.UUID, data: CategoryUpdate, user_id: uuid.UUID) -> CategoryOut:
    cat = _get_or_404(db, category_id, user_id)
    if data.name is not None and data.name != cat.name:
        existing = db.scalar(
            select(Category).where(Category.user_id == user_id, Category.name == data.name)
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": {"code": "CONFLICT", "message": "Já existe uma categoria com este nome"}},
            )
        cat.name = data.name
    if data.color is not None:
        cat.color = data.color
    db.commit()
    db.refresh(cat)
    return _to_out(cat, db)


def delete(db: Session, category_id: uuid.UUID, user_id: uuid.UUID) -> None:
    cat = _get_or_404(db, category_id, user_id)
    count = _entry_count(db, cat.id)
    if count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "CATEGORY_IN_USE",
                              "message": f"Categoria possui {count} registro(s) associado(s) e não pode ser excluída"}},
        )
    db.delete(cat)
    db.commit()
