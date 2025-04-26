// Get the review ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const reviewId = urlParams.get('id');

// Elements
const pageTitle = document.querySelector('.page-title');
const pageDescription = document.querySelector('.page-description');
const ratingNumber = document.querySelector('.h4.m-0');
const starContainer = document.querySelector('.text-warning');
const difficultyBar = document.querySelector('.progress-bar:first-of-type');
const workloadBar = document.querySelector('.progress-bar:last-of-type');
const reviewContent = document.querySelector('.h5.mb-3 + p');
const reviewContinuation = document.querySelector('.h5.mb-3 + p + p');
const authorInfo = document.querySelector('.mb-0.text-muted');

// Create star rating HTML
function createStarRating(stars) {
    return Array(stars).fill('<i class="fas fa-star"></i>').join('');
}

// Calculate progress bar width and color
function getProgressBarClass(value) {
    if (value <= 2) return 'bg-success';
    if (value <= 3) return 'bg-info';
    if (value <= 4) return 'bg-warning';
    return 'bg-danger';
}

// Calculate progress bar width
function calculateProgressWidth(value) {
    return (value / 5) * 100;
}

// Update progress bar
function updateProgressBar(element, value) {
    const width = calculateProgressWidth(value);
    element.style.width = `${width}%`;
    element.textContent = `${value}/5`;
    element.setAttribute('aria-valuenow', value);
    element.className = `progress-bar ${getProgressBarClass(value)}`;
}

// Fetch and display review
async function fetchReview() {
    try {
        const response = await fetch('https://680cee342ea307e081d57b57.mockapi.io/reviews');
        const reviews = await response.json();
        const review = reviews.find(r => r.id === parseInt(reviewId));
        
        if (review) {
            // Update page title and description
            pageTitle.textContent = `${review['course-title']} (${review['course-tag']})`;
            pageDescription.textContent = `Course Review | ${review['dr-name']} | ${review['review-date']}`;
            
            // Update rating and stars
            ratingNumber.textContent = review.stars.toFixed(1);
            starContainer.innerHTML = createStarRating(review.stars);
            
            // Update progress bars
            updateProgressBar(difficultyBar, review.difficulty);
            updateProgressBar(workloadBar, review.workload);
            
            // Update review content
            reviewContent.textContent = review['whole-review'];
            if (reviewContinuation) {
                reviewContinuation.remove();
            }
            
            // Update review metadata
            const reviewDate = new Date(review['review-date']).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            authorInfo.innerHTML = `
                <small>Posted: ${reviewDate}</small>
            `;
        } else {
            throw new Error('Review not found');
        }
    } catch (error) {
        console.error('Error fetching review:', error);
        pageTitle.textContent = 'Review Not Found';
        pageDescription.textContent = 'The requested review could not be found.';
    }
}

// Initialize the page
fetchReview();