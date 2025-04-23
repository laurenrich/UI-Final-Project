$(document).ready(function () {
    $(".quiz-btn").click(function () {
        let selected = $(this).data("value");
        $.ajax({
            url: `/quiz/${questionNumber}`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ answer: selected }),
            success: function (response) {
                if (response.correct) {
                    $("#feedback").text("✅ Correct!").css("color", "green");
                } else {
                    $("#feedback").text("❌ Incorrect.").css("color", "red");
                }
                setTimeout(() => {
                    window.location.href = `/quiz/${questionNumber + 1}`;
                }, 1500);
            }
        });
    });
});
