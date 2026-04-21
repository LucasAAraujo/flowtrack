import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.time_entry import TimeEntryIn, TimeEntryOut, TimeEntryUpdate, PaginatedTimeEntries
from app.services import time_entry_service
from app.dependencies import get_current_user

router = APIRouter(prefix="/time-entries", tags=["time-entries"])


@router.post("", response_model=TimeEntryOut, status_code=status.HTTP_201_CREATED)
def create(
    data: TimeEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return time_entry_service.create(db, data, current_user.id)


@router.get("", response_model=PaginatedTimeEntries)
def list_entries(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    category_id: uuid.UUID | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return time_entry_service.list_entries(db, current_user.id, date_from, date_to, category_id, page, page_size)


@router.get("/{entry_id}", response_model=TimeEntryOut)
def get_one(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return time_entry_service.get_one(db, entry_id, current_user.id)


@router.put("/{entry_id}", response_model=TimeEntryOut)
def update(
    entry_id: uuid.UUID,
    data: TimeEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return time_entry_service.update(db, entry_id, data, current_user.id)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    time_entry_service.delete(db, entry_id, current_user.id)
