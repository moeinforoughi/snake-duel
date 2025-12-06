"""Players and watch mode routes (package version)"""
from fastapi import APIRouter, HTTPException, status
from .database import db
from .schemas import ActivePlayerSchema, PositionSchema

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/active", response_model=list[ActivePlayerSchema])
def get_active_players() -> list[ActivePlayerSchema]:
    players = db.get_all_active_players()

    return [
        ActivePlayerSchema(
            id=player.id,
            username=player.username,
            current_score=player.current_score,
            mode=player.mode,
            snake=[PositionSchema(x=pos.x, y=pos.y) for pos in player.snake],
            food=PositionSchema(x=player.food.x, y=player.food.y),
            direction=player.direction,
            is_playing=player.is_playing,
        )
        for player in players
    ]


@router.get("/{playerId}", response_model=ActivePlayerSchema)
def get_player(playerId: str) -> ActivePlayerSchema:
    player = db.get_active_player(playerId)

    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    return ActivePlayerSchema(
        id=player.id,
        username=player.username,
        current_score=player.current_score,
        mode=player.mode,
        snake=[PositionSchema(x=pos.x, y=pos.y) for pos in player.snake],
        food=PositionSchema(x=player.food.x, y=player.food.y),
        direction=player.direction,
        is_playing=player.is_playing,
    )
