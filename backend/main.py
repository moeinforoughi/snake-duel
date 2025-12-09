"""Snake Duel API - FastAPI Backend"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
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

    # Include routers under /api prefix
    app.include_router(auth_router, prefix="/api")
    app.include_router(leaderboard_router, prefix="/api")
    app.include_router(players_router, prefix="/api")

    @app.get("/api")
    def root():
        """Root endpoint"""
        return {"message": "Snake Duel API", "version": "0.1.0"}

    @app.get("/health")
    def health_check():
        """Health check endpoint"""
        return {"status": "healthy"}
    
    # Mount static files if directory exists (for production/docker)
    if os.path.isdir("/app/static"):
        app.mount("/", StaticFiles(directory="/app/static", html=True), name="static")

        # Catch-all for SPA client-side routing (must be after other routes)
        # However, StaticFiles with html=True handles index.html at /, so we only need to handle 404s for other paths?
        # Actually StaticFiles(html=True) only serves / -> index.html. /foo -> 404.
        
        from fastapi.responses import FileResponse
        
        @app.exception_handler(404)
        async def custom_404_handler(request, exc):
            # If API request returns 404, return JSON (if it starts with /api)
            if request.url.path.startswith("/api"):
                return {"detail": "Not Found"}
            # Otherwise return index.html for SPA
            return FileResponse("/app/static/index.html")

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4000)
