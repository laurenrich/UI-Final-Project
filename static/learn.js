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

    // Add click event listeners to piano keys
    document.querySelectorAll('.white-key, .black-key').forEach(key => {
        key.addEventListener('click', function() {
            const note = this.dataset.note;
            synth.triggerAttackRelease(note, "8n");
            
            // For lesson 4, track clicked keys for chord building
            if (this.closest('#major-piano, #minor-piano')) {
                this.classList.toggle('selected');
                // Remove incorrect/correct highlights when a new selection is made
                this.classList.remove('incorrect', 'correct');
            }
        });
    });

    // Event listener for play scale button
    const playScaleBtn = document.getElementById('play-scale');
    if (playScaleBtn) {
        playScaleBtn.addEventListener('click', playScale);
    }

    // Event listeners for interval demo
    const playHalfStepBtn = document.getElementById('play-half-step');
    const playWholeStepBtn = document.getElementById('play-whole-step');
    if (playHalfStepBtn) {
        playHalfStepBtn.addEventListener('click', () => playInterval(['C4', 'C#4']));
    }
    if (playWholeStepBtn) {
        playWholeStepBtn.addEventListener('click', () => playInterval(['C4', 'D4']));
    }

    // Event listeners for chord checking
    document.querySelectorAll('.check-chord').forEach(button => {
        button.addEventListener('click', function() {
            const pianoType = this.dataset.piano;
            const piano = document.getElementById(`${pianoType}-piano`);
            
            // Clear previous highlights
            piano.querySelectorAll('.white-key, .black-key').forEach(key => {
                key.classList.remove('correct', 'incorrect');
            });
            
            const selectedNotes = Array.from(piano.querySelectorAll('.selected'))
                .map(key => key.dataset.note);
            
            const correctNotes = pianoType === 'major' ?
                ['G4', 'B4', 'D5'] : ['G4', 'Bb4', 'D5'];
            
            const feedback = piano.closest('.chord-practice')
                .querySelector('.chord-feedback');
            
            // Check each selected note
            selectedNotes.forEach(note => {
                const key = piano.querySelector(`[data-note="${note}"]`);
                if (correctNotes.includes(note)) {
                    key.classList.add('correct');
                } else {
                    key.classList.add('incorrect');
                }
            });
            
            // Highlight missing notes
            correctNotes.forEach(note => {
                if (!selectedNotes.includes(note)) {
                    const key = piano.querySelector(`[data-note="${note}"]`);
                    key.classList.add('correct');
                }
            });
            
            // Only play the selected notes
            if (selectedNotes.length > 0) {
                playChord(selectedNotes);
            }

            // Show feedback
            if (arraysEqual(selectedNotes.sort(), correctNotes.sort())) {
                feedback.textContent = 'Perfect! That\'s the correct chord!';
                feedback.style.color = 'green';
            } else {
                feedback.textContent = 'Not quite. The green keys show what you need. You can keep trying - just click keys to select or unselect them.';
                feedback.style.color = 'red';
            }
        });
    });

    // Event listeners for play chord buttons
    document.querySelectorAll('.play-chord').forEach(button => {
        button.addEventListener('click', function() {
            const pianoType = this.dataset.piano;
            const notes = pianoType === 'major' ? 
                ['C4', 'E4', 'G4'] : ['C4', 'Eb4', 'G4'];
            playChord(notes);
        });
    });

    async function playNote(note) {
        await Tone.start();
        synth.triggerAttackRelease(note, "4n");
    }

    async function playScale() {
        await Tone.start();
        const scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
        
        // Clear any existing highlights
        document.querySelectorAll('#piano .white-key, #piano .black-key')
            .forEach(key => key.classList.remove('highlight'));
        
        scale.forEach((note, index) => {
            setTimeout(() => {
                // Remove previous highlight
                document.querySelectorAll('#piano .white-key, #piano .black-key')
                    .forEach(key => key.classList.remove('highlight'));
                
                // Add highlight to current note
                const key = document.querySelector(`#piano [data-note="${note}"]`);
                if (key) {
                    key.classList.add('highlight');
                }
                
                // Play the note
                synth.triggerAttackRelease(note, "4n");
                
                // Remove highlight after note duration
                setTimeout(() => {
                    if (key) {
                        key.classList.remove('highlight');
                    }
                }, 400); // Remove highlight slightly before next note
            }, index * 500);
        });
    }

    async function playInterval(notes) {
        await Tone.start();
        // Clear previous highlights
        document.querySelectorAll('#interval-piano .white-key, #interval-piano .black-key')
            .forEach(key => key.classList.remove('highlight'));

        // Highlight and play first note
        const firstKey = document.querySelector(`#interval-piano [data-note="${notes[0]}"]`);
        firstKey.classList.add('highlight');
        synth.triggerAttackRelease(notes[0], "4n");

        // After delay, highlight and play second note
        setTimeout(() => {
            const secondKey = document.querySelector(`#interval-piano [data-note="${notes[1]}"]`);
            secondKey.classList.add('highlight');
            synth.triggerAttackRelease(notes[1], "4n");

            // Remove highlights after a moment
            setTimeout(() => {
                firstKey.classList.remove('highlight');
                secondKey.classList.remove('highlight');
            }, 1000);
        }, 500);
    }

    async function playChord(notes) {
        await Tone.start();
        notes.forEach(note => {
            synth.triggerAttackRelease(note, "2n");
        });
    }

    function arraysEqual(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    }

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
