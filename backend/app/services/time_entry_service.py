import uuid
from datetime import date, datetime, time
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.time_entry import TimeEntry
from app.models.category import Category
from app.schemas.time_entry import TimeEntryIn, TimeEntryOut, TimeEntryUpdate, PaginatedTimeEntries


def _calc_duration(start: time, end: time) -> int:
    start_minutes = start.hour * 60 + start.minute
    end_minutes = end.hour * 60 + end.minute
    return end_minutes - start_minutes


def _validate_category(db: Session, category_id: uuid.UUID, user_id: uuid.UUID) -> Category:
    cat = db.scalar(
        select(Category).where(Category.id == category_id, Category.user_id == user_id)
    )
    if cat is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "VALIDATION_ERROR",
                              "message": "Categoria não encontrada ou não pertence ao usuário"}},
        )
    return cat


def _get_or_404(db: Session, entry_id: uuid.UUID, user_id: uuid.UUID) -> TimeEntry:
    entry = db.scalar(
        select(TimeEntry).where(TimeEntry.id == entry_id, TimeEntry.user_id == user_id)
    )
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "NOT_FOUND", "message": "Registro não encontrado"}},
        )
    return entry


def _to_out(entry: TimeEntry) -> TimeEntryOut:
    return TimeEntryOut(
        id=entry.id,
        category_id=entry.category_id,
        title=entry.title,
        description=entry.description,
        date=entry.date,
        start_time=entry.start_time,
        end_time=entry.end_time,
        duration_minutes=entry.duration_minutes,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
        category_name=entry.category.name if entry.category else None,
        category_color=entry.category.color if entry.category else None,
    )


def create(db: Session, data: TimeEntryIn, user_id: uuid.UUID) -> TimeEntryOut:
    _validate_category(db, data.category_id, user_id)
    duration = _calc_duration(data.start_time, data.end_time)
    entry = TimeEntry(
        user_id=user_id,
        category_id=data.category_id,
        title=data.title,
        description=data.description,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        duration_minutes=duration,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_out(entry)


def list_entries(
    db: Session,
    user_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    category_id: uuid.UUID | None,
    page: int,
    page_size: int,
) -> PaginatedTimeEntries:
    q = select(TimeEntry).where(TimeEntry.user_id == user_id)
    if date_from:
        q = q.where(TimeEntry.date >= date_from)
    if date_to:
        q = q.where(TimeEntry.date <= date_to)
    if category_id:
        q = q.where(TimeEntry.category_id == category_id)

    total = db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(TimeEntry.date.desc(), TimeEntry.start_time.desc())
    q = q.offset((page - 1) * page_size).limit(page_size)
    entries = db.scalars(q).all()
    return PaginatedTimeEntries(
        items=[_to_out(e) for e in entries],
        total=total or 0,
        page=page,
        page_size=page_size,
    )


def get_one(db: Session, entry_id: uuid.UUID, user_id: uuid.UUID) -> TimeEntryOut:
    entry = _get_or_404(db, entry_id, user_id)
    return _to_out(entry)


def update(db: Session, entry_id: uuid.UUID, data: TimeEntryUpdate, user_id: uuid.UUID) -> TimeEntryOut:
    entry = _get_or_404(db, entry_id, user_id)

    if data.category_id is not None:
        _validate_category(db, data.category_id, user_id)
        entry.category_id = data.category_id
    if data.title is not None:
        entry.title = data.title
    if data.description is not None:
        entry.description = data.description
    if data.date is not None:
        entry.date = data.date
    if data.start_time is not None:
        entry.start_time = data.start_time
    if data.end_time is not None:
        entry.end_time = data.end_time

    entry.duration_minutes = _calc_duration(entry.start_time, entry.end_time)
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return _to_out(entry)


def delete(db: Session, entry_id: uuid.UUID, user_id: uuid.UUID) -> None:
    entry = _get_or_404(db, entry_id, user_id)
    db.delete(entry)
    db.commit()
