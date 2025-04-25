const sounds = {
  "C": "https://piano-mp3.s3.us-west-1.amazonaws.com/C.mp3",
  "D": "https://piano-mp3.s3.us-west-1.amazonaws.com/D.mp3",
  "E": "https://piano-mp3.s3.us-west-1.amazonaws.com/E.mp3",
  "F": "https://piano-mp3.s3.us-west-1.amazonaws.com/F.mp3",
  "G": "https://piano-mp3.s3.us-west-1.amazonaws.com/G.mp3",
  "A": "https://piano-mp3.s3.us-west-1.amazonaws.com/A.mp3",
  "B": "https://piano-mp3.s3.us-west-1.amazonaws.com/B.mp3"
};

$(document).ready(function () {
    // Initialize Tone.js synth
    const synth = new Tone.Synth().toDestination();
    let selectedNotes = new Set();

    // Handle piano key clicks
    $('.white-key, .black-key').click(function() {
        const note = $(this).data('note');
        if (!note) return;
        
        // Toggle selection
        $(this).toggleClass('selected');
        if (selectedNotes.has(note)) {
            selectedNotes.delete(note);
        } else {
            selectedNotes.add(note);
        }
        
        // Play the note
        synth.triggerAttackRelease(note, "8n");
    });

    // Play C Major Scale
    $('#play-scale').click(async function() {
        // Need to start audio context on user gesture
        await Tone.start();
        
        // Play each note in the scale with a slight delay
        const scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
        scale.forEach((note, index) => {
            setTimeout(() => {
                synth.triggerAttackRelease(note, "4n");
                // Highlight the key being played
                $(`.white-key[data-note="${note}"]`).addClass('selected');
                setTimeout(() => {
                    $(`.white-key[data-note="${note}"]`).removeClass('selected');
                }, 500);
            }, index * 600);
        });
    });

    // Submit chord (for interactive lessons)
    $('#submit-chord').click(function() {
        const userNotes = Array.from(selectedNotes).sort();
        const gMajor = ["G4", "B4", "D5"].sort();
        const gMinor = ["G4", "Bb4", "D5"].sort();
        
        // Compare arrays
        const isGMajor = arraysEqual(userNotes, gMajor);
        const isGMinor = arraysEqual(userNotes, gMinor);
        
        let feedback = "";
        if (isGMajor) {
            feedback = "✅ That's a G Major chord!";
        } else if (isGMinor) {
            feedback = "✅ That's a G Minor chord!";
        } else {
            feedback = "❌ That's not a correct G chord. Try again!";
        }
        
        $('#chord-feedback').html(feedback);
    });
});

// Helper function to compare arrays
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
