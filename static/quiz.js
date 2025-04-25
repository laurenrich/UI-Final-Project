$(document).ready(function () {
    // Initialize Tone.js synth
    const synth = new Tone.Synth().toDestination();
    let selectedNotes = new Set();
    let selectedOption = null;
    
    // Handle piano key clicks for piano questions
    $('.white-key, .black-key').click(function() {
        if (window.questionType !== 'piano') return;
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

    // Handle multiple choice option clicks
    $('.option-btn').click(function() {
        if (window.questionType !== 'multiple_choice') return;
        
        // Remove selection from other buttons
        $('.option-btn').removeClass('btn-primary').addClass('btn-outline-primary');
        // Select this button
        $(this).removeClass('btn-outline-primary').addClass('btn-primary');
        selectedOption = $(this).data('value');

        // Submit the answer automatically
        submitMultipleChoiceAnswer();
    });
    
    // Play button - plays the correct chord
    $('#play-btn').click(async function() {
        // Need to start audio context on user gesture
        await Tone.start();
        
        // Play each note in the chord with a slight delay
        window.correctNotes.forEach((note, index) => {
            setTimeout(() => {
                synth.triggerAttackRelease(note, "4n");
            }, index * 200);
        });
    });

    function submitMultipleChoiceAnswer() {
        const correct = selectedOption === window.correctOption;
        
        // Show feedback
        $('#feedback').empty();
        if (correct) {
            $('#feedback').append('<div class="text-success">✅ Correct!</div>');
        } else {
            $('#feedback').append('<div class="text-danger">❌ Incorrect</div>');
        }
        
        // Submit to server
        $.ajax({
            url: `/quiz/${questionNumber}`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ 
                answer: [selectedOption],
                correct: correct
            }),
            success: function() {
                // Wait 2 seconds before moving to next question
                setTimeout(() => {
                    window.location.href = `/quiz/${questionNumber + 1}`;
                }, 2000);
            }
        });
    }
    
    // Submit button (only for piano questions)
    $('#submit-btn').click(function() {
        if (window.questionType !== 'piano') return;
        
        const userNotes = Array.from(selectedNotes).sort();
        const correct = arraysEqual(userNotes, window.correctNotes.sort());
        
        // Show feedback on each key
        $('.white-key, .black-key').each(function() {
            const note = $(this).data('note');
            if (!note) return;
            
            $(this).removeClass('selected correct incorrect');
            
            if (window.correctNotes.includes(note)) {
                $(this).addClass('correct');
                if (!selectedNotes.has(note)) {
                    // Missing correct note
                    $('#feedback').append(`<div class="text-danger">Missing note: ${note}</div>`);
                }
            } else if (selectedNotes.has(note)) {
                // Incorrectly selected note
                $(this).addClass('incorrect');
                $('#feedback').append(`<div class="text-danger">Wrong note: ${note}</div>`);
            }
        });
        
        // Show overall feedback
        if (correct) {
            $('#feedback').prepend('<div class="text-success">✅ Correct!</div>');
        } else {
            $('#feedback').prepend('<div class="text-danger">❌ Incorrect</div>');
        }
        
        // Submit to server
        $.ajax({
            url: `/quiz/${questionNumber}`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ 
                answer: Array.from(selectedNotes),
                correct: correct
            }),
            success: function() {
                // Wait 3 seconds before moving to next question
                setTimeout(() => {
                    window.location.href = `/quiz/${questionNumber + 1}`;
                }, 3000);
            }
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
