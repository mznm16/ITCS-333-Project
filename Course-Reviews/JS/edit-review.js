// Get the review ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const reviewId = urlParams.get('id');

// Form elements
const form = document.getElementById('editReviewForm');
const ratingInputs = document.querySelectorAll('input[name="overallRating"]');
const difficultySelect = document.getElementById('difficulty');
const workloadSelect = document.getElementById('workload');
const reviewTextarea = document.getElementById('reviewText');

// Load existing review data
async function loadReview() {
    try {
        const response = await fetch(`https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/get_review.php?id=${reviewId}`);
        const data = await response.json();
        const review = data.review;

        if (review) {
            // Set rating
            const ratingInput = document.querySelector(`input[name="overallRating"][value="${Math.round(review.rating)}"]`);
            if (ratingInput) {
                ratingInput.checked = true;
            }

            // Set difficulty and workload
            difficultySelect.value = review.difficulty;
            workloadSelect.value = review.workload;

            // Set review text
            reviewTextarea.value = review.details;
        } else {
            alert('Review not found');
            window.location.href = 'course-reviews.html';
        }
    } catch (err) {
        console.error('Error loading review:', err);
        alert('Error loading review. Please try again later.');
    }
}

// Handle form submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (reviewTextarea.value.length < 100) {
        alert('Review must be at least 100 characters long');
        return;
    }

    const selectedRating = document.querySelector('input[name="overallRating"]:checked');
    if (!selectedRating) {
        alert('Please select a rating');
        return;
    }

    try {
        const data = {
            id: reviewId,
            rating: parseFloat(selectedRating.value),
            difficulty: parseInt(difficultySelect.value),
            workload: parseInt(workloadSelect.value),
            summary: reviewTextarea.value.substring(0, 100) + '...',
            details: reviewTextarea.value
        };

        const response = await fetch('https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/update_review.php', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert('Review updated successfully!');
            window.location.href = `view-review.html?id=${reviewId}`;
        } else {
            alert(result.error || 'Failed to update review');
        }
    } catch (err) {
        console.error('Error updating review:', err);
        alert('Error updating review. Please try again later.');
    }
});

// Load the review data when the page loads
loadReview();
