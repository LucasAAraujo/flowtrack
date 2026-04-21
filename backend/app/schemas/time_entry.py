import uuid
from datetime import date, datetime, time
from pydantic import BaseModel, Field, model_validator, ConfigDict


class TimeEntryIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=2000)
    category_id: uuid.UUID
    date: date
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_times(self) -> "TimeEntryIn":
        if self.end_time <= self.start_time:
            raise ValueError("end_time deve ser maior que start_time")
        if self.date > date.today():
            raise ValueError("date não pode estar no futuro")
        return self


class TimeEntryUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=2000)
    category_id: uuid.UUID | None = None
    date: date | None = None
    start_time: time | None = None
    end_time: time | None = None

    @model_validator(mode="after")
    def validate_times(self) -> "TimeEntryUpdate":
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValueError("end_time deve ser maior que start_time")
        if self.date and self.date > date.today():
            raise ValueError("date não pode estar no futuro")
        return self


class TimeEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category_id: uuid.UUID
    title: str
    description: str | None
    date: date
    start_time: time
    end_time: time
    duration_minutes: int
    created_at: datetime
    updated_at: datetime
    category_name: str | None = None
    category_color: str | None = None


class PaginatedTimeEntries(BaseModel):
    items: list[TimeEntryOut]
    total: int
    page: int
    page_size: int
