import random
from typing import List, Dict

Question = Dict[str, str]


def build_questions() -> List[Question]:
    """Return a shuffled list of school-friendly quiz questions."""
    questions: List[Question] = [
        {
            "question": "Wie viele Kontinente gibt es auf der Erde?",
            "answer": "7",
        },
        {
            "question": "Welcher Planet ist der dritte von der Sonne?",
            "answer": "Erde",
        },
        {
            "question": "Wie nennt man das Ergebnis einer Multiplikation?",
            "answer": "Produkt",
        },
        {
            "question": "Wie viele Minuten hat eine Stunde?",
            "answer": "60",
        },
        {
            "question": "Welches chemische Symbol hat Wasser?",
            "answer": "H2O",
        },
        {
            "question": "Wie viele Seiten hat ein Quadrat?",
            "answer": "4",
        },
        {
            "question": "Welcher Ozean ist der größte?",
            "answer": "Pazifik",
        },
        {
            "question": "Wie nennt man eine Zahl, die man mit 2 ohne Rest teilen kann?",
            "answer": "Gerade",
        },
        {
            "question": "Welcher berühmte Wissenschaftler stellte die Relativitätstheorie auf?",
            "answer": "Einstein",
        },
        {
            "question": "Wie viele Grad hat ein rechter Winkel?",
            "answer": "90",
        },
        {
            "question": "Wie heißt die Hauptstadt von Frankreich?",
            "answer": "Paris",
        },
        {
            "question": "Welches Tier ist das größte auf der Erde?",
            "answer": "Blauwal",
        },
        {
            "question": "Wie viele Bundesländer hat Deutschland?",
            "answer": "16",
        },
    ]
    random.shuffle(questions)
    return questions


def ask_yes_no(prompt: str) -> bool:
    """Return True for yes, False for no based on user input."""
    while True:
        choice = input(prompt).strip().lower()
        if choice in {"j", "ja", "y", "yes"}:
            return True
        if choice in {"n", "nein", "no"}:
            return False
        print("Bitte mit 'j' oder 'n' antworten.")


def play_round() -> int:
    """Play a single round and return the final score."""
    questions = build_questions()
    score = 0

    while True:
        if not questions:
            questions = build_questions()

        die_roll = random.randint(1, 6)
        question = questions.pop()

        print("\nDu hast eine", die_roll, "gewürfelt.")
        print("Frage:", question["question"])
        user_answer = input("Deine Antwort: ").strip()

        if user_answer.lower() == question["answer"].lower():
            score += die_roll
            print("Richtig! Du erhältst", die_roll, "Punkte. Aktueller Stand:", score)

            if score > 13:
                print("Du bist wirklich eine Expertin bzw. ein Experte!")

            if not ask_yes_no("Weiter würfeln? (j/n): "):
                print("Runde beendet mit", score, "Punkten.")
                break
        else:
            score = 0
            print("Leider falsch. Alle Punkte wurden gelöscht. Spiel zu Ende.")
            break

    return score


def main() -> None:
    print("Willkommen beim Würfel-Quiz für die 6. bis 8. Klasse!")

    while True:
        _ = play_round()
        if not ask_yes_no("Noch eine Runde spielen? (j/n): "):
            print("Danke fürs Spielen! Bis zum nächsten Mal.")
            return


if __name__ == "__main__":
    main()
