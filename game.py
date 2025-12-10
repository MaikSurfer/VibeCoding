import json
import random
import time
from pathlib import Path

WORDS = [
    {"word": "rom", "hint": "Hauptstadt des Römischen Reichs."},
    {"word": "berlin", "hint": "Deutsche Hauptstadt."},
    {"word": "amun", "hint": "Altägyptischer Gott."},
    {"word": "sahara", "hint": "Größte heiße Wüste der Erde."},
    {"word": "nile", "hint": "Längster Fluss Afrikas."},
    {"word": "troja", "hint": "Legendäre Stadt aus Homers Epen."},
    {"word": "athen", "hint": "Geburtsort der Demokratie."},
    {"word": "alpen", "hint": "Großes Gebirge in Europa."},
    {"word": "vikinger", "hint": "Nordische Seefahrer des Mittelalters."},
    {"word": "suez", "hint": "Ägyptischer Kanal zwischen Rotem Meer und Mittelmeer."},
]

HIGHSCORE_PATH = Path("high_scores.json")
TIME_LIMIT_SECONDS = 20
POINTS_PER_WORD = 10


def load_high_scores():
    if not HIGHSCORE_PATH.exists():
        return []
    try:
        return json.loads(HIGHSCORE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def save_high_scores(high_scores):
    HIGHSCORE_PATH.write_text(json.dumps(high_scores, ensure_ascii=False, indent=2), encoding="utf-8")


def scramble_word(word):
    letters = list(word)
    scrambled = word
    while scrambled == word and len(set(letters)) > 1:
        scrambled = "".join(random.sample(letters, len(letters)))
    return scrambled


def play_round(word_entry):
    word = word_entry["word"]
    hint = word_entry["hint"]
    scrambled = scramble_word(word)
    print(f"\nBuchstabensalat: {scrambled} (Hinweis: {hint})")
    start_time = time.time()
    answer = input("Deine Lösung: ").strip().lower()
    duration = time.time() - start_time

    if duration > TIME_LIMIT_SECONDS:
        print("Zeitlimit überschritten! Runde beendet.")
        return False, 0

    if answer == word.lower():
        print("Richtig! +10 Punkte")
        return True, POINTS_PER_WORD

    print(f"Leider falsch. Das gesuchte Wort war '{word}'.")
    return True, 0


def update_high_scores(name, score):
    high_scores = load_high_scores()
    high_scores.append({"name": name, "score": score})
    high_scores.sort(key=lambda entry: entry["score"], reverse=True)
    save_high_scores(high_scores[:20])


def show_high_scores():
    high_scores = load_high_scores()
    if not high_scores:
        print("Noch keine Einträge in der Highscore-Tabelle.")
        return

    print("\nHighscore-Tabelle:")
    for index, entry in enumerate(high_scores, start=1):
        print(f"{index:2d}. {entry['name']:15} {entry['score']} Punkte")


def main():
    print("Willkommen zum Geschichts- und Geografie-Buchstabensalat!")
    print(f"Du hast pro Wort {TIME_LIMIT_SECONDS} Sekunden Zeit. Pro Treffer gibt es {POINTS_PER_WORD} Punkte.")

    word_pool = WORDS.copy()
    random.shuffle(word_pool)

    total_points = 0
    for entry in word_pool:
        continue_game, earned = play_round(entry)
        total_points += earned
        if not continue_game:
            break

    print(f"\nSpiel beendet. Gesamtpunkte: {total_points}")
    name = input("Wie heißt du? ").strip() or "Unbekannt"
    update_high_scores(name, total_points)
    show_high_scores()


if __name__ == "__main__":
    main()
