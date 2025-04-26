// State variables
let currentPage = 1;
const itemsPerPage = 6;
let allReviews = [];

// Elements
const itemList = document.querySelector('.item-list');
const paginationContainer = document.querySelector('.pagination');
const searchInput = document.querySelector('.search-input');

// Fetch reviews from the API
async function fetchReviews() {
    try {
        const response = await fetch('https://680cee342ea307e081d57b57.mockapi.io/reviews');
        allReviews = await response.json();
        displayReviews();
        setupPagination();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        itemList.innerHTML = '<p class="error">Failed to load reviews. Please try again later.</p>';
    }
}

// Create star rating HTML
function createStarRating(stars) {
    let starsHtml = '';
    for (let i = 0; i < stars; i++) {
        starsHtml += '<i class="fas fa-star text-warning"></i>';
    }
    return `${starsHtml} ${stars}/5`;
}

// Display reviews for current page
function displayReviews(filteredReviews = null) {
    const reviews = filteredReviews || allReviews;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReviews = reviews.slice(startIndex, endIndex);

    itemList.innerHTML = currentReviews.map(review => `
        <article class="item-card">
            <div class="item-content">
                <div class="item-meta">
                    <span class="item-tag">${review['course-tag']}</span>
                    <span class="item-date">${review['review-date']}</span>
                </div>
                <h2 class="item-title">${review['course-title']}</h2>
                <p class="item-desc">${review['short-desc']}</p>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div>
                        <span class="me-3">${createStarRating(review.stars)}</span>
                        <span><i class="fas fa-user"></i> ${review['dr-name']}</span>
                    </div>
                    <a href="view-review.html?id=${review.id}" class="module-link">Read Reviews <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `).join('');
}

// Setup pagination
function setupPagination(filteredReviews = null) {
    const reviews = filteredReviews || allReviews;
    const pageCount = Math.ceil(reviews.length / itemsPerPage);
    
    paginationContainer.innerHTML = '';
    
    // Previous button
    if (pageCount > 1) {
        paginationContainer.innerHTML += `
            <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }

    // Page numbers
    for (let i = 1; i <= pageCount; i++) {
        if (
            i === 1 || 
            i === pageCount || 
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            paginationContainer.innerHTML += `
                <button class="page-btn ${currentPage === i ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (
            i === currentPage - 2 || 
            i === currentPage + 2
        ) {
            paginationContainer.innerHTML += `
                <button class="page-btn">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            `;
        }
    }

    // Next button
    if (pageCount > 1) {
        paginationContainer.innerHTML += `
            <button class="page-btn ${currentPage === pageCount ? 'disabled' : ''}" 
                    ${currentPage === pageCount ? 'disabled' : ''} 
                    onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
}

// Change page
function changePage(newPage) {
    if (newPage >= 1 && newPage <= Math.ceil(allReviews.length / itemsPerPage)) {
        currentPage = newPage;
        displayReviews();
        setupPagination();
    }
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredReviews = allReviews.filter(review => 
        review['course-tag'].toLowerCase().includes(searchTerm) ||
        review['course-title'].toLowerCase().includes(searchTerm) ||
        review['dr-name'].toLowerCase().includes(searchTerm) ||
        review['short-desc'].toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    displayReviews(filteredReviews);
    setupPagination(filteredReviews);
});

// Initialize the page
fetchReviews();