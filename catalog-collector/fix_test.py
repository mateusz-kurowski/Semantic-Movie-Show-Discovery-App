with open("src/tests/test_db.py", "r") as f:
    content = f.read()

content = content.replace(
    """        link_pairs = {(l.movie_id, l.genre_id) for l in links}
        # Movie 1 has Action (1) and Comedy (2)
        # Movie 2 has Drama (3)
        assert (1, 1) in link_pairs
        assert (1, 2) in link_pairs
        assert (2, 3) in link_pairs""",
    """
        # Verify specific linkages instead of assuming ID orders
        action_id = next(g.id for g in genres if g.name == "Action")
        comedy_id = next(g.id for g in genres if g.name == "Comedy")
        drama_id = next(g.id for g in genres if g.name == "Drama")
        
        link_pairs = {(l.movie_id, l.genre_id) for l in links}
        assert (1, action_id) in link_pairs
        assert (1, comedy_id) in link_pairs
        assert (2, drama_id) in link_pairs
""",
)

with open("src/tests/test_db.py", "w") as f:
    f.write(content)
