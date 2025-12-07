"""Snake Duel API - FastAPI Backend"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes_auth import router as auth_router
from app.routes_leaderboard import router as leaderboard_router
from app.routes_players import router as players_router
from app.database import init_db


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    # Initialize database
    init_db()

    app = FastAPI(
        title="Snake Duel API",
        description="OpenAPI specification for Snake Duel multiplayer game",
        version="0.1.0",
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(auth_router)
    app.include_router(leaderboard_router)
    app.include_router(players_router)

    @app.get("/")
    def root():
        """Root endpoint"""
        return {"message": "Snake Duel API", "version": "0.1.0"}

    @app.get("/health")
    def health_check():
        """Health check endpoint"""
        return {"status": "healthy"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4000)
