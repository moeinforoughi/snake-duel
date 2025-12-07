"""Leaderboard routes using SQLAlchemy"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from .database import get_db, User, LeaderboardEntry
from .schemas import LeaderboardEntrySchema, ScoreSubmissionRequest, ScoreSubmissionResult
from .routes_auth import get_current_user

router = APIRouter(tags=["leaderboard"])


@router.get("/leaderboard", response_model=list[LeaderboardEntrySchema])
def get_leaderboard(
    limit: int = Query(10, ge=1),
    mode: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> list[LeaderboardEntrySchema]:
    """Get leaderboard entries, optionally filtered by mode"""
    query = db.query(LeaderboardEntry)
    
    if mode:
        query = query.filter(LeaderboardEntry.mode == mode)
    
    # Sort by score descending, then by date descending
    entries = query.order_by(
        LeaderboardEntry.score.desc(),
        LeaderboardEntry.date.desc()
    ).limit(limit).all()

    return [
        LeaderboardEntrySchema(
            id=entry.id,
            user_id=entry.user_id,
            username=entry.username,
            score=entry.score,
            mode=entry.mode,
            date=entry.date,
        )
        for entry in entries
    ]


@router.post("/leaderboard/score", response_model=ScoreSubmissionResult)
def submit_score(
    request: ScoreSubmissionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ScoreSubmissionResult:
    """Submit a score to the leaderboard"""
    # Create leaderboard entry
    entry = LeaderboardEntry(
        user_id=user.id,
        username=user.username,
        score=request.score,
        mode=request.mode,
    )
    db.add(entry)
    
    # Update user's high score if needed
    if request.score > user.high_score:
        user.high_score = request.score
    
    db.commit()
    db.refresh(entry)

    # Calculate rank (how many entries have a higher score in this mode)
    rank_query = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.mode == request.mode,
        LeaderboardEntry.score > request.score
    ).count()
    rank = rank_query + 1  # Rank is 1-indexed

    return ScoreSubmissionResult(success=True, rank=rank)
