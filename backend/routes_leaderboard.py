"""Leaderboard routes"""
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from typing import Optional
from database import db, User
from schemas import LeaderboardEntrySchema, ScoreSubmissionRequest, ScoreSubmissionResult
from routes_auth import get_current_user

router = APIRouter(tags=["leaderboard"])


@router.get("/leaderboard", response_model=list[LeaderboardEntrySchema])
def get_leaderboard(
    limit: int = Query(10, ge=1),
    mode: Optional[str] = Query(None),
) -> list[LeaderboardEntrySchema]:
    """Get leaderboard entries"""
    entries = db.get_leaderboard(limit=limit, mode=mode)

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
) -> ScoreSubmissionResult:
    """Submit a score to the leaderboard"""
    # Add entry to leaderboard
    entry = db.add_leaderboard_entry(
        user_id=user.id,
        username=user.username,
        score=request.score,
        mode=request.mode,
    )

    # Get rank
    rank = db.get_leaderboard_rank(request.score, mode=request.mode)

    return ScoreSubmissionResult(
        success=True,
        rank=rank,
    )
