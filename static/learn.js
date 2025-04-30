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
    const synth = new Tone.PolySynth().toDestination();
    let selectedNotesMajor = new Set();
    let selectedNotesMinor = new Set();
    let selectedNotes = new Set(); // for lesson 4

    // Remove incorrect and correct key highlights
    function clearKeyHighlights(pianoId) {
        $(`#${pianoId} .white-key, #${pianoId} .black-key`).removeClass('incorrect correct');
    }

    // Handle piano key clicks for all pianos
    $('.white-key, .black-key').click(function() {
        const note = $(this).data('note');
        if (!note) return;
        
        // Determine which piano was clicked
        const piano = $(this).closest('.piano-container').find('div[id]').attr('id');
        
        // Toggle selection and store notes in appropriate Set
        $(this).toggleClass('selected');
        
        if (piano === 'major-piano') {
            if (selectedNotesMajor.has(note)) {
                selectedNotesMajor.delete(note);
            } else {
                selectedNotesMajor.add(note);
            }
            clearKeyHighlights('major-piano');
        } else if (piano === 'minor-piano') {
            if (selectedNotesMinor.has(note)) {
                selectedNotesMinor.delete(note);
            } else {
                selectedNotesMinor.add(note);
            }
            clearKeyHighlights('minor-piano');
        } else if (piano === 'chord-piano') {
            if (selectedNotes.has(note)) {
                selectedNotes.delete(note);
            } else {
                selectedNotes.add(note);
            }
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

    // Play Chord buttons (for lesson 3)
    $('.play-chord').click(async function() {
        await Tone.start();
        
        const pianoType = $(this).data('piano');
        const selectedNotes = pianoType === 'major' ? selectedNotesMajor : selectedNotesMinor;
        const correctChord = pianoType === 'major' ? 
            new Set(["C4", "E4", "G4"]) : 
            new Set(["C4", "Eb4", "G4"]);
        
        // Play all selected notes simultaneously
        const notesToPlay = Array.from(selectedNotes);
        if (notesToPlay.length > 0) {
            synth.triggerAttackRelease(notesToPlay, "2n");
        }

        // Clear previous highlights
        clearKeyHighlights(pianoType + '-piano');
        
        // Check each selected note and highlight incorrect ones
        let allCorrect = true;
        selectedNotes.forEach(note => {
            if (!correctChord.has(note)) {
                // Highlight incorrect key in red
                $(`#${pianoType}-piano [data-note="${note}"]`).addClass('incorrect');
                allCorrect = false;
            }
        });

        // Highlight missing correct notes
        correctChord.forEach(note => {
            if (!selectedNotes.has(note)) {
                // Highlight missing key in green
                $(`#${pianoType}-piano [data-note="${note}"]`).addClass('correct');
                allCorrect = false;
            }
        });
        
        // Show feedback
        const feedback = allCorrect ? 
            "✅ Perfect! That's the correct chord!" : 
            "❌ Not quite. Red keys are incorrect, green keys show the correct notes.";
        
        // Show feedback
        $(this).closest('.controls').find('.chord-feedback').html(feedback);
    });

    // Submit chord (for lesson 4)
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

// Helper function to compare Sets
function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (let item of a) {
        if (!b.has(item)) return false;
    }
    return true;
}
