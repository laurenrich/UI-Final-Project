import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect

app = Flask(__name__)

# Reset quiz answers at the start of each session
quiz_answers = []

def load_quiz_data():
    with open("data/quiz.json") as f:
        return json.load(f)

with open("data/lessons.json") as f:
    lessons = json.load(f)

@app.route("/")
def index():
    # Reset quiz answers when returning to home
    global quiz_answers
    quiz_answers = []
    return render_template("index.html")

@app.route("/learn/<int:n>")
def learn(n):
    lesson_data = next((item for item in lessons if item["lesson"] == n), None)
    return render_template("learn.html", lesson_data=lesson_data)

@app.route("/quiz/<int:n>", methods=["GET", "POST"])
def quiz(n):
    global quiz_answers
    # If it's the first question and a GET request, reset session answers
    if n == 1 and request.method == "GET":
        quiz_answers = []
    
    # Reload quiz data on each request to ensure latest version
    quizzes = load_quiz_data()
    question_data = next((item for item in quizzes if item["question"] == n), None)
    total_questions = len(quizzes)
    progress = int((n / total_questions) * 100)

    if not question_data:
        return redirect("/result")

    if request.method == "POST":
        data = request.get_json()
        answer = data.get("answer")
        correct = data.get("correct", False)
        quiz_answers.append({
            "question": n,
            "selected": answer,
            "correct": correct
        })
        return jsonify({"correct": correct})

    return render_template("quiz.html", question_data=question_data, current_question=n, total_questions=total_questions, progress=progress)

@app.route("/result")
def result():
    total_questions = len(load_quiz_data())  # Get actual number of questions
    score = sum(1 for q in quiz_answers if q["correct"])
    return render_template("result.html", score=score, total=total_questions)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
