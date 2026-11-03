import json
import os
import re
import pytest

WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

def test_files_exist():
    assert os.path.exists(os.path.join(WORKSPACE_DIR, "leaderboard-standalone.html"))
    assert os.path.exists(os.path.join(WORKSPACE_DIR, "index.html"))
    assert os.path.exists(os.path.join(WORKSPACE_DIR, "data.js"))
    assert os.path.exists(os.path.join(WORKSPACE_DIR, "leaderboard-data.json"))

def test_data_js_structure():
    data_js_path = os.path.join(WORKSPACE_DIR, "data.js")
    with open(data_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "window.LEADERBOARD_INITIAL_DATA" in content
    # Extract JSON part
    match = re.search(r"window\.LEADERBOARD_INITIAL_DATA\s*=\s*(\{.*?\});", content, re.DOTALL)
    assert match is not None, "Could not extract JSON from data.js"
    
    data = json.loads(match.group(1))
    assert data["app"] == "leaderboard-suite"
    assert "theme" in data
    assert isinstance(data["leaderboard"], list)
    assert isinstance(data["cards"], list)
    assert len(data["leaderboard"]) >= 10
    assert len(data["cards"]) >= 10

def test_leaderboard_data_json():
    json_path = os.path.join(WORKSPACE_DIR, "leaderboard-data.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["app"] == "leaderboard-suite"
    assert "theme" in data
    assert len(data["leaderboard"]) >= 10
    
    for player in data["leaderboard"]:
        assert "nickname" in player
        assert "score" in player
        assert "icon" in player
        assert isinstance(player["score"], int)
        assert len(player["nickname"].strip()) > 0

    for card in data["cards"]:
        assert "icon" in card
        assert "score" in card
        assert "info" in card

def test_standalone_html_integrity():
    html_path = os.path.join(WORKSPACE_DIR, "leaderboard-standalone.html")
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "<!DOCTYPE html>" in content
    assert '<meta charset="utf-8">' in content
    assert '<meta name="viewport"' in content
    assert "<title>" in content
    assert "theme-dripit" in content
    assert "#9b8975" in content
    assert "#2d3e50" in content
    assert "#dc3546" in content
    assert "/* --- SEED_INJECTION_ANCHOR --- */" in content
    assert "safe_local_storage_set" in content
    assert "normalizeSearchText" in content
    assert "id=\"confetti-canvas\"" in content
    assert "AudioEngine" in content

@pytest.mark.parametrize("file_name", ["data.js", "leaderboard-data.json"])
def test_data_avatars_and_scores(file_name):
    file_path = os.path.join(WORKSPACE_DIR, file_name)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    if file_name.endswith(".js"):
        match = re.search(r"window\.LEADERBOARD_INITIAL_DATA\s*=\s*(\{.*?\});", content, re.DOTALL)
        data = json.loads(match.group(1))
    else:
        data = json.loads(content)

    valid_avatars = {"hawk", "abram", "bytex", "voyager", "kianna", "alfonso", "lion", "fox", "panda", "unicorn", "owl", "tiger", "dolphin", "frog", "trophy", "fire", "gift", "star", "rocket", "shield", "user"}

    for p in data["leaderboard"]:
        assert p["score"] >= 0
        assert p["icon"].lower() in valid_avatars
        assert len(p["nickname"].strip()) > 0
