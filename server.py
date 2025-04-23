import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect

app = Flask(__name__)

user_actions = []
quiz_answers = []

with open("data/lessons.json") as f:
    lessons = json.load(f)

with open("data/quiz.json") as f:
    quizzes = json.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/learn/<int:n>")
def learn(n):
    lesson_data = next((item for item in lessons if item["lesson"] == n), None)
    user_actions.append({
        "page": f"learn/{n}",
        "time": datetime.now().isoformat()
    })
    return render_template("learn.html", lesson_data=lesson_data)

@app.route("/quiz/<int:n>", methods=["GET", "POST"])
def quiz(n):
    question_data = next((item for item in quizzes if item["question"] == n), None)

    if not question_data:
        return redirect("/result")

    if request.method == "POST":
        data = request.get_json()
        answer = data.get("answer")
        correct = (answer == question_data["answer"])
        quiz_answers.append({
            "question": n,
            "selected": answer,
            "correct": correct
        })
        return jsonify({"correct": correct})

    return render_template("quiz.html", question_data=question_data)

@app.route("/result")
def result():
    score = sum(1 for q in quiz_answers if q["correct"])
    return render_template("result.html", score=score, total=len(quiz_answers))

if __name__ == "__main__":
    app.run(debug=True, port=5001)
