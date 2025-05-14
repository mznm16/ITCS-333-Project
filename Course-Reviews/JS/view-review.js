// Get the review ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const reviewId = urlParams.get('id');

// Elements
const pageTitle = document.querySelector('.page-title');
const pageDescription = document.querySelector('.page-description');
const ratingNumber = document.querySelector('.bg-primary .h4.m-0');
const starContainer = document.querySelector('.text-warning');
const difficultyBar = document.getElementById('difficultyBar');
const workloadBar = document.getElementById('workloadBar');
const reviewContent = document.querySelector('.review-content');
const reviewerInfo = document.querySelector('.text-muted small:first-of-type');
const postedInfo = document.querySelector('.text-muted small:last-of-type');

// Debug log for important elements
console.log('Workload bar element:', workloadBar);
console.log('Difficulty bar element:', difficultyBar);
console.log('Review content element:', reviewContent);
console.log('Reviewer info element:', reviewerInfo);
console.log('Posted info element:', postedInfo);

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
    if (!element) {
        console.error('Progress bar element not found');
        return;
    }
    
    if (value === undefined || value === null) {
        console.error('Invalid value for progress bar:', value);
        return;
    }
    
    // Ensure value is a number between 0 and 5
    const numValue = Number(value);
    if (isNaN(numValue)) {
        console.error('Progress bar value is not a number:', value);
        return;
    }
    
    const clampedValue = Math.max(0, Math.min(5, numValue));
    const width = calculateProgressWidth(clampedValue);
    
    try {
        element.style.width = `${width}%`;
        element.textContent = `${clampedValue}/5`;
        element.setAttribute('aria-valuenow', clampedValue);
        element.className = `progress-bar ${getProgressBarClass(clampedValue)}`;
        console.log(`Progress bar updated successfully. Value: ${clampedValue}, Width: ${width}%`);
    } catch (error) {
        console.error('Error updating progress bar:', error);
    }
}

// Update star rating display
function updateStarRating(container, rating) {
    if (!container) return;
    container.innerHTML = createStarRating(rating);
}

// Update rating number display
function updateRatingNumber(element, rating) {
    if (!element) return;
    element.textContent = rating.toFixed(1);
}

function clearComments() {
    const commentsContainer = document.getElementById('comments-container');
    if (commentsContainer) {
        commentsContainer.innerHTML = '';
    }
}

// Render comments in the Comments section
function renderComments(comments) {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    // Clear existing comments
    clearComments();
    
    const commentsCount = comments.length;
    let commentsHtml = `<p class="text-muted"><i class="fas fa-comments me-2"></i>${commentsCount} comment${commentsCount !== 1 ? 's' : ''}</p>`;
    
    if (commentsCount > 0) {
        commentsHtml += comments.map(c => `
            <div class="comment-item mb-3">
                <strong>${c.commenter}</strong> 
                <span class="text-muted small">${new Date(c.created_at).toLocaleDateString('en-US')}</span>
                <p class="mb-1">${c.comment}</p>
                <hr>
            </div>
        `).join('');
    }
    
    commentsContainer.innerHTML = commentsHtml;
}

// Fetch and display review
async function fetchReview() {
    try {
        const response = await fetch(`https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/get_review.php?id=${reviewId}`);
        const data = await response.json();
        const review = data.review;
        if (review) {
            // Update page title and description
            if (pageTitle) {
                pageTitle.textContent = `${review.name} (${review.code})`;
            }
            if (pageDescription) {
                pageDescription.textContent = `Course Review | ${review.professor} | ${new Date(review.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`;
            }            // Log review data for debugging
            console.log('Review data:', review);
            
            // Update rating displays
            updateRatingNumber(ratingNumber, review.rating);
            updateStarRating(starContainer, Math.round(review.rating));
              // Update progress bars with error handling
            if (review.difficulty === undefined) {
                console.error('Missing difficulty value in review data');
            } else {
                console.log('Setting difficulty to:', review.difficulty);
                updateProgressBar(difficultyBar, review.difficulty);
            }
            
            if (review.workload === undefined) {
                console.error('Missing workload value in review data');
            } else {
                console.log('Setting workload to:', review.workload);
                updateProgressBar(workloadBar, review.workload);
            }
            
            // Update review content with error handling
            if (reviewContent) {
                reviewContent.textContent = review.details || 'No review details available';
            } else {
                console.error('Review content element not found');
            }
            
            // Update reviewer information with error handling
            if (reviewerInfo && postedInfo) {
                reviewerInfo.textContent = `Review by: ${review.reviewer || 'Anonymous'}`;
                const postedDate = review.created_at 
                    ? new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                    : 'Unknown date';
                postedInfo.textContent = `Posted: ${postedDate}`;
            } else {
                console.error('Reviewer or posted info elements not found');
            }
            // Update review metadata
            if (authorInfo) {
                authorInfo.innerHTML = `<small>Review by: ${review.reviewer}</small><br><small>Posted: ${new Date(review.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</small>`;
            }
            // Render comments
            renderComments(data.comments);
        } else {
            throw new Error('Review not found');
        }
    } catch (error) {
        console.error('Error fetching review:', error);
        if (pageTitle) {
            pageTitle.textContent = 'Review Not Found';
        }
        if (pageDescription) {
            pageDescription.textContent = 'The requested review could not be found.';
        }
    }
}

// Handle delete review
const deleteBtn = document.querySelector('.btn-outline-danger');
if (deleteBtn) {
    deleteBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/delete_review.php?id=${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Review deleted successfully!');
                window.location.href = 'course-reviews.html'; // Redirect back to the reviews list
            } else {
                alert(result.error || 'Failed to delete review.');
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Error deleting review. Please try again later.');
        }
    });
}

// Handle edit review button
const editBtn = document.querySelector('.btn-outline-secondary');
if (editBtn) {
    editBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = `edit-review.html?id=${reviewId}`;
    });
}

// Handle comment form submission
const commentForm = document.getElementById('commentForm');
if (commentForm) {
    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const commentText = document.getElementById('commentText').value.trim();
        if (!commentText) return;
        
        try {
            const response = await fetch('https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/submit_comment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    review_id: reviewId,
                    commenter: 'Anonymous',
                    comment: commentText
                })
            });
            
            const result = await response.json();
            if (result.success) {
                // Fetch updated comments instead of reloading the page
                const reviewResponse = await fetch(`https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/get_review.php?id=${reviewId}`);
                const reviewData = await reviewResponse.json();
                renderComments(reviewData.comments);
                commentForm.reset();
            } else {
                alert('Failed to submit comment.');
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
            alert('Error submitting comment. Please try again.');
        }
    });
}

// Initialize the page
fetchReview();