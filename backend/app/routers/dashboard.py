from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.time_entry import TimeEntry
from app.models.category import Category
from app.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(
    query_date: date = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = query_date or date.today()

    total_today = db.scalar(
        select(func.sum(TimeEntry.duration_minutes)).where(
            TimeEntry.user_id == current_user.id,
            TimeEntry.date == today,
        )
    ) or 0

    by_category_rows = db.execute(
        select(
            Category.id,
            Category.name,
            Category.color,
            func.sum(TimeEntry.duration_minutes).label("total_minutes"),
        )
        .join(TimeEntry, TimeEntry.category_id == Category.id)
        .where(TimeEntry.user_id == current_user.id, TimeEntry.date == today)
        .group_by(Category.id, Category.name, Category.color)
        .order_by(func.sum(TimeEntry.duration_minutes).desc())
    ).all()

    total_by_category = [
        {
            "category_id": str(row.id),
            "name": row.name,
            "color": row.color,
            "total_minutes": row.total_minutes,
        }
        for row in by_category_rows
    ]

    last_7_days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        mins = db.scalar(
            select(func.sum(TimeEntry.duration_minutes)).where(
                TimeEntry.user_id == current_user.id,
                TimeEntry.date == d,
            )
        ) or 0
        last_7_days.append({"date": str(d), "total_minutes": mins})

    return {
        "date": str(today),
        "total_minutes_today": total_today,
        "total_by_category": total_by_category,
        "last_7_days": last_7_days,
    }
