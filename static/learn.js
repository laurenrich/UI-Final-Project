const sounds = {
  "C": "/static/audio/C.mp3",
  "D": "/static/audio/D.mp3",
  "E": "/static/audio/E.mp3",
  "F": "/static/audio/F.mp3",
  "G": "/static/audio/G.mp3",
  "A": "/static/audio/A.mp3",
  "B": "/static/audio/B.mp3"
};

// Pre-initialize Tone.js to avoid startup delay
Tone.start();
Tone.context.latencyHint = 'interactive';

// Create synth outside document.ready to initialize early
const synth = new Tone.PolySynth({
    envelope: {
        attack: 0.01,  // Faster attack time
        decay: 0.5,
        sustain: 0.3,
        release: 1
    }
}).toDestination();

// Preload common notes to minimize delay
function preloadNotes() {
    // Silently trigger notes to warm up the audio engine
    const commonNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    synth.triggerAttackRelease(commonNotes, 0.01, Tone.now(), 0.0001); // Very quiet, almost silent
}

// Call preload when user interacts with the page
window.addEventListener('click', function() {
    if (!window.audioInitialized) {
        preloadNotes();
        window.audioInitialized = true;
    }
}, {once: true});

$(document).ready(function () {
    // Initialize sets for tracking selected notes
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

    // Event listeners for interval demo 1 (C to C# and C to D)
    const playHalfStepBtn = document.getElementById('play-half-step');
    const playWholeStepBtn = document.getElementById('play-whole-step');
    if (playHalfStepBtn) {
        playHalfStepBtn.addEventListener('click', () => playInterval(['C4', 'C#4'], 'interval-piano'));
    }
    if (playWholeStepBtn) {
        playWholeStepBtn.addEventListener('click', () => playInterval(['C4', 'D4'], 'interval-piano'));
    }
    
    // Event listeners for interval demo 2 (E to F and E to F#)
    const playHalfStepBtn2 = document.getElementById('play-half-step-2');
    const playWholeStepBtn2 = document.getElementById('play-whole-step-2');
    if (playHalfStepBtn2) {
        playHalfStepBtn2.addEventListener('click', () => playInterval(['E4', 'F4'], 'interval-piano-2'));
    }
    if (playWholeStepBtn2) {
        playWholeStepBtn2.addEventListener('click', () => playInterval(['E4', 'F#4'], 'interval-piano-2'));
    }
    
    // Event listeners for interval demo 3 (F# to G and F# to G#)
    const playHalfStepBtn3 = document.getElementById('play-half-step-3');
    const playWholeStepBtn3 = document.getElementById('play-whole-step-3');
    if (playHalfStepBtn3) {
        playHalfStepBtn3.addEventListener('click', () => playInterval(['F#4', 'G4'], 'interval-piano-3'));
    }
    if (playWholeStepBtn3) {
        playWholeStepBtn3.addEventListener('click', () => playInterval(['F#4', 'G#4'], 'interval-piano-3'));
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
    
    // Event listeners for show intervals buttons
    document.querySelectorAll('.show-intervals').forEach(button => {
        button.addEventListener('click', function() {
            const chordType = this.dataset.chordType;
            demonstrateIntervals(chordType);
        });
    });
    
    // Function to demonstrate the half steps to the third note
    function demonstrateIntervals(chordType) {
        // Reset all highlights and counters
        document.querySelectorAll('.white-key, .black-key').forEach(key => {
            key.classList.remove('highlight', 'chord-blue', 'chord-third');
            const counters = key.querySelectorAll('.step-counter');
            counters.forEach(counter => counter.remove());
        });
        
        // Define the piano container based on chord type using specific IDs
        const pianoContainer = chordType === 'major' ? 
            document.getElementById('major-chord-diagram') : 
            document.getElementById('minor-chord-diagram');
        
        // Log for debugging
        console.log('Chord type:', chordType);
        console.log('Piano container found:', pianoContainer);
        
        // Define the notes and steps for each chord type
        const chordNotes = chordType === 'major' ? 
            ['C4', 'E4', 'G4'] : ['C4', 'Eb4', 'G4'];
        
        // Define the sequence of notes to the third (including half steps)
        const halfStepSequence = chordType === 'major' ? 
            ['C4', 'C#4', 'D4', 'D#4', 'E4'] : ['C4', 'C#4', 'D4', 'Eb4'];
        
        // Number of half steps to the third
        const halfStepCount = chordType === 'major' ? 4 : 3;
        
        // First play the chord notes in sequence
        playChordSequence(chordNotes, halfStepSequence, halfStepCount, pianoContainer, chordType);
    }
    
    // Function to play the chord notes first, then demonstrate half steps
    function playChordSequence(chordNotes, halfStepSequence, totalSteps, pianoContainer, chordType) {
        let time = Tone.now();
        const interval = 0.6; // Time between notes
        
        // First play the chord notes in sequence
        chordNotes.forEach((note, index) => {
            // Play the chord note
            synth.triggerAttackRelease(note, "8n", time + index * interval);
            
            // Schedule UI updates for chord notes
            setTimeout(() => {
                // Clear previous highlights only in this piano container
                pianoContainer.querySelectorAll('.white-key, .black-key').forEach(key => {
                    key.classList.remove('highlight', 'chord-blue', 'chord-third');
                });
                
                // Highlight all chord notes played so far
                for (let i = 0; i <= index; i++) {
                    const chordKey = pianoContainer.querySelector(`[data-note="${chordNotes[i]}"]`);
                    if (chordKey) {
                        if (i === 1) { // The third note
                            chordKey.classList.add('chord-blue');
                        } else {
                            chordKey.classList.add('chord-blue');
                        }
                    }
                }
                
                // After playing all chord notes, show the half steps
                if (index === chordNotes.length - 1) {
                    setTimeout(() => {
                        showHalfSteps(halfStepSequence, totalSteps, chordNotes, pianoContainer, chordType);
                    }, 1000);
                }
            }, index * interval * 1000);
        });
    }
    
    // Function to show half steps with counters
    function showHalfSteps(notes, totalSteps, chordNotes, pianoContainer, chordType) {
        let time = Tone.now();
        const interval = 0.6; // Time between notes
        
        // We'll add step counters as we play each note
        // First, make sure there are no counters left
        pianoContainer.querySelectorAll('.step-counter').forEach(counter => {
            counter.remove();
        });
        
        // Highlight the chord notes in blue
        chordNotes.forEach((note, index) => {
            const key = pianoContainer.querySelector(`[data-note="${note}"]`);
            if (key) {
                if (index === 1) { // The third note
                    key.classList.add('chord-third');
                } else {
                    key.classList.add('chord-blue');
                }
            }
        });
        
        // Play the half step sequence
        notes.forEach((note, index) => {
            // Skip the root note as we already played it
            if (index > 0) {
                // Play the note after a delay
                synth.triggerAttackRelease(note, "8n", time + (index - 1) * interval);
                
                // Schedule UI updates
                setTimeout(() => {
                    // Remove temporary highlights only in this piano container
                    pianoContainer.querySelectorAll('.white-key, .black-key').forEach(key => {
                        if (!key.classList.contains('chord-blue') && !key.classList.contains('chord-third')) {
                            key.classList.remove('highlight');
                        }
                    });
                    
                    // Add highlight to current note if it's not already highlighted
                    const key = pianoContainer.querySelector(`[data-note="${note}"]`);
                    if (key && !key.classList.contains('chord-blue') && !key.classList.contains('chord-third')) {
                        key.classList.add('highlight');
                        
                        // Add step counter for this note
                        if (index <= totalSteps) {
                            const counter = document.createElement('div');
                            counter.className = 'step-counter';
                            counter.textContent = index;
                            key.appendChild(counter);
                        }
                    }
                    
                    // Special handling for the third note
                    if (index === totalSteps) { // This is the third note
                        const thirdKey = pianoContainer.querySelector(`[data-note="${note}"]`);
                        if (thirdKey) {
                            // Remove other classes and add chord-third
                            thirdKey.classList.remove('chord-blue', 'highlight');
                            thirdKey.classList.add('chord-third');
                            
                            // Make sure the counter is still visible
                            if (!thirdKey.querySelector('.step-counter')) {
                                const counter = document.createElement('div');
                                counter.className = 'step-counter';
                                counter.textContent = index;
                                thirdKey.appendChild(counter);
                            }
                        }
                    }
                }, (index - 1) * interval * 1000);
            }
        });
    }

    // Optimized playNote function with minimal delay
    function playNote(note) {
        // Use immediate scheduling for minimal latency
        synth.triggerAttackRelease(note, "8n", Tone.now());
    }
    
    // Optimized playScale function
    function playScale() {
        const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        let time = Tone.now();
        const interval = 0.5;
        
        // Pre-schedule all notes at once for better timing
        scale.forEach((note, index) => {
            synth.triggerAttackRelease(note, "8n", time + index * interval);
            
            // Use requestAnimationFrame for smoother UI updates
            const scheduleTime = performance.now() + (index * interval * 1000);
            scheduleHighlight(note, scheduleTime, index === scale.length - 1);
        });
        
        function scheduleHighlight(note, time, isLast) {
            const currentTime = performance.now();
            if (currentTime >= time) {
                // Remove previous highlights
                $('.white-key, .black-key').removeClass('highlight');
                
                // Add highlight to current note
                $(`[data-note="${note}"]`).addClass('highlight');
                
                // Remove highlight after a short delay if it's the last note
                if (isLast) {
                    setTimeout(() => {
                        $('.white-key, .black-key').removeClass('highlight');
                    }, 500);
                }
            } else {
                requestAnimationFrame(() => scheduleHighlight(note, time, isLast));
            }
        }
    }
    
    // Optimized playInterval function
    function playInterval(notes, pianoId = 'interval-piano') {
        let time = Tone.now();
        const interval = 0.5;
        
        // Pre-schedule all notes at once
        notes.forEach((note, index) => {
            synth.triggerAttackRelease(note, "8n", time + index * interval);
            
            // Schedule UI updates
            setTimeout(() => {
                // Remove previous highlights
                $(`#${pianoId} .white-key, #${pianoId} .black-key`).removeClass('highlight');
                
                // Add highlight to current note
                $(`#${pianoId} [data-note="${note}"]`).addClass('highlight');
                
                // Remove highlight after a short delay
                if (index === notes.length - 1) {
                    setTimeout(() => {
                        $(`#${pianoId} .white-key, #${pianoId} .black-key`).removeClass('highlight');
                    }, 500);
                }
            }, index * interval * 1000);
        });
    }
    
    // Optimized playChord function for minimal delay
    function playChord(notes) {
        // Use immediate scheduling and shorter duration for more responsive feel
        synth.triggerAttackRelease(notes, "2n", Tone.now());
    }

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

    async function playInterval(notes, pianoId = 'interval-piano') {
        await Tone.start();
        // Clear previous highlights
        document.querySelectorAll(`#${pianoId} .white-key, #${pianoId} .black-key`)
            .forEach(key => key.classList.remove('highlight'));

        // Highlight and play first note
        const firstKey = document.querySelector(`#${pianoId} [data-note="${notes[0]}"]`);
        firstKey.classList.add('highlight');
        synth.triggerAttackRelease(notes[0], "4n");

        // After delay, highlight and play second note
        setTimeout(() => {
            const secondKey = document.querySelector(`#${pianoId} [data-note="${notes[1]}"]`);
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
    
    // Pre-initialize Tone.js to eliminate startup delay
    Tone.start();
    
    // Pre-define chord notes for all lessons to eliminate lookup time
    const chordNotes = {
        // Taylor Swift chords
        'taylor': {
            'g_major': ['G4', 'B4', 'D5'],
            'd_major': ['D4', 'F#4', 'A4'],
            'a_minor': ['A3', 'C4', 'E4'],
            'c_major': ['C4', 'E4', 'G4']
        },
        // Beyoncé chords
        'beyonce': {
            'a_major': ['A3', 'C#4', 'E4'],
            'b_minor': ['B3', 'D4', 'F#4'],
            'f_sharp_minor': ['F#3', 'A3', 'C#4'],
            'd_major': ['D3', 'F#3', 'A3']
        }
    };
    
    // Taylor Swift chord building lesson functionality (lesson 6)
    // Add click event listeners to piano keys for the Taylor Swift chord building lesson
    document.querySelectorAll('#taylor-g-piano .white-key, #taylor-g-piano .black-key, #taylor-d-piano .white-key, #taylor-d-piano .black-key, #taylor-a-piano .white-key, #taylor-a-piano .black-key, #taylor-c-piano .white-key, #taylor-c-piano .black-key').forEach(key => {
        key.addEventListener('click', function() {
            const note = this.dataset.note;
            synth.triggerAttackRelease(note, "8n");
            
            // Track clicked keys for chord building
            this.classList.toggle('selected');
            // Remove incorrect/correct highlights when a new selection is made
            this.classList.remove('incorrect', 'correct');
        });
    });
    
    // Event listeners for checking Taylor Swift chords
    document.querySelectorAll('.check-taylor-chord').forEach(button => {
        button.addEventListener('click', function() {
            const chordType = this.dataset.chord;
            const pianoId = 'taylor-' + chordType.split('_')[0] + '-piano'; // e.g., 'taylor-g-piano' for g_major
            const piano = document.getElementById(pianoId);
            
            // Clear previous highlights
            piano.querySelectorAll('.white-key, .black-key').forEach(key => {
                key.classList.remove('correct', 'incorrect');
            });
            
            const selectedNotes = Array.from(piano.querySelectorAll('.selected'))
                .map(key => key.dataset.note);
            
            const correctNotes = chordNotes.taylor[chordType];
            
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
                synth.triggerAttackRelease(selectedNotes, "2n");
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
    
    // Taylor Swift video lesson functionality (lesson 7)
    const taylorVideo = document.getElementById('taylor-swift-video');
    if (taylorVideo) {
        // Auto-play when ready
        taylorVideo.addEventListener('loadedmetadata', function() {
            // Ready to play
        });
    }
    
    // Chord button functionality for Taylor Swift lesson - optimized for minimal delay
    $('.play-taylor-chord').on('click', function() {
        const chordType = $(this).data('chord');
        const notes = chordNotes.taylor[chordType];
        
        // Start playing the chord immediately before UI updates
        // This reduces perceived latency by prioritizing audio playback
        synth.triggerAttackRelease(notes, "2n", Tone.now());
        
        // Use requestAnimationFrame for smoother UI updates
        requestAnimationFrame(() => {
            // Clear previous highlights
            const pianoKeys = $('#taylor-piano .white-key, #taylor-piano .black-key');
            pianoKeys.removeClass('highlight');
            
            // Highlight the keys in the chord
            notes.forEach(note => {
                $(`#taylor-piano [data-note="${note}"]`).addClass('highlight');
            });
        });
    });
    
    // Beyoncé chord building lesson functionality (lesson 8)
    // Add click event listeners to piano keys for the Beyoncé chord building lesson
    document.querySelectorAll('#beyonce-a-piano .white-key, #beyonce-a-piano .black-key, #beyonce-b-piano .white-key, #beyonce-b-piano .black-key, #beyonce-f-piano .white-key, #beyonce-f-piano .black-key, #beyonce-d-piano .white-key, #beyonce-d-piano .black-key').forEach(key => {
        key.addEventListener('click', function() {
            const note = this.dataset.note;
            synth.triggerAttackRelease(note, "8n");
            
            // Track clicked keys for chord building
            this.classList.toggle('selected');
            // Remove incorrect/correct highlights when a new selection is made
            this.classList.remove('incorrect', 'correct');
        });
    });
    
    // Event listeners for checking Beyoncé chords
    document.querySelectorAll('.check-beyonce-chord').forEach(button => {
        button.addEventListener('click', function() {
            const chordType = this.dataset.chord;
            let pianoId;
            
            // Determine which piano to use based on chord type
            if (chordType === 'a_major') {
                pianoId = 'beyonce-a-piano';
            } else if (chordType === 'b_minor') {
                pianoId = 'beyonce-b-piano';
            } else if (chordType === 'f_sharp_minor') {
                pianoId = 'beyonce-f-piano';
            } else if (chordType === 'd_major') {
                pianoId = 'beyonce-d-piano';
            }
            
            const piano = document.getElementById(pianoId);
            
            // Clear previous highlights
            piano.querySelectorAll('.white-key, .black-key').forEach(key => {
                key.classList.remove('correct', 'incorrect');
            });
            
            const selectedNotes = Array.from(piano.querySelectorAll('.selected'))
                .map(key => key.dataset.note);
            
            const correctNotes = chordNotes.beyonce[chordType];
            
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
                synth.triggerAttackRelease(selectedNotes, "2n");
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
    
    // Beyoncé Halo video lesson functionality (lesson 9)
    const beyonceVideo = document.getElementById('beyonce-video');
    if (beyonceVideo) {
        // Auto-play when ready
        beyonceVideo.addEventListener('loadedmetadata', function() {
            // Ready to play
        });
    }
    
    // Chord button functionality for Beyoncé lesson - optimized for minimal delay
    $('.play-beyonce-chord').on('click', function() {
        const chordType = $(this).data('chord');
        const notes = chordNotes.beyonce[chordType];
        
        // Start playing the chord immediately before UI updates
        // This reduces perceived latency by prioritizing audio playback
        synth.triggerAttackRelease(notes, "2n", Tone.now());
        
        // Use requestAnimationFrame for smoother UI updates
        requestAnimationFrame(() => {
            // Clear previous highlights
            const pianoKeys = $('#beyonce-piano .white-key, #beyonce-piano .black-key');
            pianoKeys.removeClass('highlight');
            
            // Highlight the keys in the chord
            notes.forEach(note => {
                $(`#beyonce-piano [data-note="${note}"]`).addClass('highlight');
            });
        });
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

// Taylor Swift lesson functionality (lesson 6)
// Move this code inside the main document.ready function to access the synth variable

