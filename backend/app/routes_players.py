"""Players and watch mode routes using SQLAlchemy"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
import json
from .database import get_db, ActivePlayer
from .schemas import ActivePlayerSchema, PositionSchema

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/active", response_model=list[ActivePlayerSchema])
def get_active_players(db: Session = Depends(get_db)) -> list[ActivePlayerSchema]:
    """Get all active players in watch mode"""
    players = db.query(ActivePlayer).filter(ActivePlayer.is_playing == True).all()

    return [
        ActivePlayerSchema(
            id=player.id,
            username=player.username,
            current_score=player.current_score,
            mode=player.mode,
            snake=[
                PositionSchema(x=pos["x"], y=pos["y"]) 
                for pos in json.loads(player.snake_json)
            ],
            food=PositionSchema(x=player.food_x, y=player.food_y),
            direction=player.direction,
            is_playing=player.is_playing,
        )
        for player in players
    ]


@router.get("/{playerId}", response_model=ActivePlayerSchema)
def get_player(playerId: str, db: Session = Depends(get_db)) -> ActivePlayerSchema:
    """Get a specific active player by ID"""
    player = db.query(ActivePlayer).filter(ActivePlayer.id == playerId).first()

    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    return ActivePlayerSchema(
        id=player.id,
        username=player.username,
        current_score=player.current_score,
        mode=player.mode,
        snake=[
            PositionSchema(x=pos["x"], y=pos["y"]) 
            for pos in json.loads(player.snake_json)
        ],
        food=PositionSchema(x=player.food_x, y=player.food_y),
        direction=player.direction,
        is_playing=player.is_playing,
    )
