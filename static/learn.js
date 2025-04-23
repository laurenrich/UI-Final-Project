const sounds = {
  "C": "https://piano-mp3.s3.us-west-1.amazonaws.com/C.mp3",
  "D": "https://piano-mp3.s3.us-west-1.amazonaws.com/D.mp3",
  "E": "https://piano-mp3.s3.us-west-1.amazonaws.com/E.mp3",
  "F": "https://piano-mp3.s3.us-west-1.amazonaws.com/F.mp3",
  "G": "https://piano-mp3.s3.us-west-1.amazonaws.com/G.mp3",
  "A": "https://piano-mp3.s3.us-west-1.amazonaws.com/A.mp3",
  "B": "https://piano-mp3.s3.us-west-1.amazonaws.com/B.mp3"
};

let selectedNotes = [];

$(document).ready(function () {
  $(".key").click(function () {
    let note = $(this).data("note");
    let audio = $("#audio-player")[0];
    audio.src = sounds[note];
    audio.play();

    $(this).toggleClass("active");

    if (selectedNotes.includes(note)) {
      selectedNotes = selectedNotes.filter(n => n !== note);
    } else {
      selectedNotes.push(note);
    }
  });

  $("#submit-chord").click(function () {
    const major = ["G", "B", "D"].sort().toString();
    const minor = ["G", "Bb", "D"].sort().toString();
    const userChord = selectedNotes.sort().toString();

    let feedback = "";
    if (userChord === major) {
      feedback = "✅ That's a G Major chord!";
    } else if (userChord === minor) {
      feedback = "✅ That's a G Minor chord!";
    } else {
      feedback = "❌ That's not a correct G chord. Try again!";
    }

    $("#chord-feedback").text(feedback);
  });
});
