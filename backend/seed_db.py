"""Seed the mock database with fake data for testing"""
from datetime import datetime, timedelta
from app.database import db, Position, ActivePlayer


def seed_database():
    """Add additional fake users, leaderboard entries, and active players"""
    # Create more test users
    users_data = [
        ("dave", "dave@example.com", "password"),
        ("eve", "eve@example.com", "password"),
        ("frank", "frank@example.com", "password"),
        ("grace", "grace@example.com", "password"),
    ]

    created_users = []
    for username, email, password in users_data:
        if not db.get_user_by_email(email):
            user = db.create_user(username, email, password)
            created_users.append(user)

    # Add more leaderboard entries
    base_time = datetime.now()
    scores = [
        (db.users[list(db.users.keys())[0]], 920, "passthrough", -10),
        (db.users[list(db.users.keys())[1]], 750, "walls", -7),
        (db.users[list(db.users.keys())[2]], 580, "passthrough", -4),
        (db.users[list(db.users.keys())[3]], 1200, "walls", -1),
    ]

    for user, score, mode, days_ago in scores:
        db.add_leaderboard_entry(user.id, user.username, score, mode)

    # Add more active players
    if len(db.users) > 1:
        users_list = list(db.users.values())
        for i, user in enumerate(users_list[1:4]):  # Add 3 more active players
            snake = [
                Position(10 + i, 10),
                Position(9 + i, 10),
                Position(8 + i, 10),
            ]
            food = Position(15 + i, 15 + i)
            mode = "walls" if i % 2 == 0 else "passthrough"
            active_player = ActivePlayer(
                id=user.id,
                username=user.username,
                current_score=150 + (i * 50),
                mode=mode,
                snake=snake,
                food=food,
                direction=["UP", "DOWN", "LEFT", "RIGHT"][i % 4],
                is_playing=True,
            )
            db.set_active_player(active_player)

    print("✓ Database seeded with fake data")
    print(f"  - Users: {len(db.users)}")
    print(f"  - Leaderboard entries: {len(db.leaderboard)}")
    print(f"  - Active players: {len(db.active_players)}")


if __name__ == "__main__":
    seed_database()
