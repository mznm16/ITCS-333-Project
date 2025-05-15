// Validation state
const validationState = {
    courseCode: false,
    courseName: false,
    professor: false,
    semester: false,
    rating: false,
    review: false
};

// Form elements
const form = document.getElementById('reviewForm');
const courseCodeInput = document.getElementById('courseCode');
const courseNameInput = document.getElementById('courseName');
const professorInput = document.getElementById('professor');
const semesterSelect = document.getElementById('semester');
const ratingInputs = document.querySelectorAll('input[name="overallRating"]');
const reviewTextarea = document.getElementById('reviewText');
const tagsInput = document.getElementById('tags');

// Validation functions
function validateCourseCode(value) {
    // Course code format: 4 letters followed by 3 numbers (e.g., ITCS333)
    const regex = /^[A-Z]{4}\d{3}$/i;
    return regex.test(value);
}

function validateMinLength(value, minLength) {
    return value.trim().length >= minLength;
}

function showError(element, message) {
    const formGroup = element.closest('.mb-3');
    let errorDiv = formGroup.querySelector('.invalid-feedback');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        formGroup.appendChild(errorDiv);
    }
    
    element.classList.add('is-invalid');
    element.classList.remove('is-valid');
    errorDiv.textContent = message;
}

function showSuccess(element) {
    const formGroup = element.closest('.mb-3');
    const errorDiv = formGroup.querySelector('.invalid-feedback');
    
    element.classList.remove('is-invalid');
    element.classList.add('is-valid');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Event listeners for real-time validation
courseCodeInput.addEventListener('input', function() {
    const isValid = validateCourseCode(this.value);
    validationState.courseCode = isValid;
    
    if (isValid) {
        showSuccess(this);
    } else {
        showError(this, 'Course code must be 4 letters followed by 3 numbers (e.g., ITCS333)');
    }
});

courseNameInput.addEventListener('input', function() {
    const isValid = validateMinLength(this.value, 3);
    validationState.courseName = isValid;
    
    if (isValid) {
        showSuccess(this);
    } else {
        showError(this, 'Course name must be at least 3 characters long');
    }
});

professorInput.addEventListener('input', function() {
    const isValid = validateMinLength(this.value, 3);
    validationState.professor = isValid;
    
    if (isValid) {
        showSuccess(this);
    } else {
        showError(this, 'Professor name must be at least 3 characters long');
    }
});

semesterSelect.addEventListener('change', function() {
    const isValid = this.value !== '';
    validationState.semester = isValid;
    
    if (isValid) {
        showSuccess(this);
    } else {
        showError(this, 'Please select a semester');
    }
});

ratingInputs.forEach(input => {
    input.addEventListener('change', function() {
        validationState.rating = true;
        const ratingGroup = this.closest('.mb-3');
        const errorDiv = ratingGroup.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    });
});

reviewTextarea.addEventListener('input', function() {
    const isValid = validateMinLength(this.value, 100);
    validationState.review = isValid;
    
    if (isValid) {
        showSuccess(this);
    } else {
        showError(this, 'Review must be at least 100 characters long');
    }
});

// Form submission handler
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate all fields
    if (!validateCourseCode(courseCodeInput.value)) {
        showError(courseCodeInput, 'Course code must be 4 letters followed by 3 numbers (e.g., ITCS333)');
    }
    
    if (!validateMinLength(courseNameInput.value, 3)) {
        showError(courseNameInput, 'Course name must be at least 3 characters long');
    }
    
    if (!validateMinLength(professorInput.value, 3)) {
        showError(professorInput, 'Professor name must be at least 3 characters long');
    }
    
    if (semesterSelect.value === '') {
        showError(semesterSelect, 'Please select a semester');
    }
    
    // Check rating
    const selectedRating = document.querySelector('input[name="overallRating"]:checked');
    if (!selectedRating) {
        const ratingGroup = document.querySelector('.rating-stars').closest('.mb-3');
        if (!ratingGroup.querySelector('.invalid-feedback')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback d-block';
            errorDiv.textContent = 'Please select a rating';
            ratingGroup.appendChild(errorDiv);
        }
        return;
    }
    
    if (!validateMinLength(reviewTextarea.value, 100)) {
        showError(reviewTextarea, 'Review must be at least 100 characters long');
        return;
    }
    
    // Check if all validations pass
    const isFormValid = Object.values(validationState).every(Boolean);
    
    if (isFormValid) {
        try {
            const reviewer = document.getElementById('anonymous').checked ? 'Anonymous' : prompt('Enter your name (or leave blank for Anonymous):', 'Anonymous') || 'Anonymous';
            // Gather form data
            const data = {
                course_code: courseCodeInput.value,
                course_name: courseNameInput.value,
                professor: professorInput.value,
                semester: semesterSelect.value,
                reviewer: reviewer,
                rating: parseFloat(document.querySelector('input[name="overallRating"]:checked').value),
                difficulty: parseInt(document.getElementById('difficulty').value),
                workload: parseInt(document.getElementById('workload').value),
                summary: reviewTextarea.value.substring(0, 100) + '...',
                details: reviewTextarea.value
            };

            console.log('Sending review data:', data);
            
            const response = await fetch('https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/submit_review.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response:', e);
                alert('Server returned invalid response. Please try again.');
                return;
            }
            
            console.log('Parsed response:', result);
            
            if (result.success) {
                alert('Review submitted successfully!');
                form.reset();
                document.querySelectorAll('.is-valid').forEach(element => {
                    element.classList.remove('is-valid');
                });
                Object.keys(validationState).forEach(key => {
                    validationState[key] = false;
                });
            } else {
                const errorMessage = result.error || result.mysql_error || 'Unknown error occurred';
                console.error('Server error:', errorMessage);
                alert(`Failed to submit review: ${errorMessage}`);
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Network error while submitting review. Please check your connection and try again.');
        }
    }
});