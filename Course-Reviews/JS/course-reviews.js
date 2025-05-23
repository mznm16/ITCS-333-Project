// State variables
let currentPage = 1;
const itemsPerPage = 6;
let allReviews = [];
let activeFilters = {
    ratings: []
};
let activeSort = null;
let isLoading = false;

// Elements
const itemList = document.querySelector('.item-list');
const paginationContainer = document.querySelector('.pagination');
const searchInput = document.querySelector('.search-input');
const filterBtn = document.getElementById('filterBtn');
const sortBtn = document.getElementById('sortBtn');
const filterMenu = document.getElementById('filterMenu');
const sortMenu = document.getElementById('sortMenu');
const applyFilterBtn = document.querySelector('.apply-filter-btn');
const applySortBtn = document.querySelector('.apply-sort-btn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Show/hide loading state
function setLoading(loading) {
    isLoading = loading;
    loadingOverlay.style.display = loading ? 'flex' : 'none';
}

// Load reviews from PHP backend
async function fetchReviews() {
    try {
        setLoading(true);
        const response = await fetch('https://2b911c75-2d5f-4b3a-b7ac-c4f37dc4f726-00-4nbzx33z7xnv.pike.replit.dev/get_reviews.php');
        allReviews = await response.json();
        displayReviews();
        setupPagination();
    } catch (error) {
        console.error('Error loading reviews:', error);
        itemList.innerHTML = '<p class="error">Failed to load reviews. Please try again later.</p>';
    } finally {
        setLoading(false);
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

// Apply filters and sort with loading state
async function applyFiltersAndSort(reviews) {
    setLoading(true);
    
    // Simulate network delay for smoother UI
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...reviews];    // Apply rating filters with safety checks
    if (activeFilters.ratings.length > 0) {
        filtered = filtered.filter(review => {
            const rating = Math.round(review.rating || 0);
            return activeFilters.ratings.includes(rating.toString());
        });
    }    // Apply sort with safety checks
    if (activeSort) {
        filtered.sort((a, b) => {
            // Ensure both objects have default values for comparison
            const aName = (a && a.name) || '';
            const bName = (b && b.name) || '';
            const aRating = (a && a.rating) || 0;
            const bRating = (b && b.rating) || 0;
            const aDate = (a && a.created_at) || '1970-01-01';
            const bDate = (b && b.created_at) || '1970-01-01';

            switch (activeSort) {
                case 'rating-desc':
                    return bRating - aRating;
                case 'rating-asc':
                    return aRating - bRating;
                case 'date-desc':
                    return new Date(bDate) - new Date(aDate);
                case 'date-asc':
                    return new Date(aDate) - new Date(bDate);
                case 'name-asc':
                    return aName.localeCompare(bName);
                case 'name-desc':
                    return bName.localeCompare(aName);
                default:
                    return 0;
            }
        });
    }

    setLoading(false);
    return filtered;
}

// Filter reviews based on search term
async function filterReviews(searchTerm) {
    setLoading(true);
    
    // Simulate network delay for smoother UI
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const searchResults = allReviews.filter(review => {
        // Add null checks for each property
        const code = (review.code || '').toLowerCase();
        const name = (review.name || '').toLowerCase();
        const professor = (review.professor || '').toLowerCase();
        const summary = (review.summary || '').toLowerCase();
        
        return code.includes(searchTerm) ||
               name.includes(searchTerm) ||
               professor.includes(searchTerm) ||
               summary.includes(searchTerm);
    });
    
    // Apply existing filters and sort to search results
    const processed = await applyFiltersAndSort(searchResults);
    setLoading(false);
    return processed;
}

// Display reviews for current page
async function displayReviews(filteredReviews = null) {
    let reviews;
    if (filteredReviews) {
        reviews = filteredReviews;
    } else {
        setLoading(true);
        reviews = await applyFiltersAndSort(allReviews);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReviews = reviews.slice(startIndex, endIndex);

    if (currentReviews.length === 0) {
        itemList.innerHTML = '<p class="text-center mt-4">No reviews found matching your criteria.</p>';
        setLoading(false);
        return;
    }

    itemList.innerHTML = currentReviews.map(review => `
        <article class="item-card">
            <div class="item-content">
                <div class="item-meta">
                    <span class="item-tag">${review.code}</span>
                    <span class="item-date">${new Date(review.created_at).toLocaleDateString('en-US')}</span>
                </div>
                <h2 class="item-title">${review.name}</h2>
                <p class="item-desc">${review.summary}</p>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div>
                        <span class="me-3">${createStarRating(Math.round(review.rating))}</span>
                        <span><i class="fas fa-user"></i> ${review.professor}</span>
                    </div>
                    <a href="view-review.html?id=${review.id}" class="module-link">Read Reviews <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `).join('');

    setupPagination(reviews);
    setLoading(false);
}

// Setup pagination
function setupPagination(filteredReviews = null) {
    const reviews = filteredReviews || applyFiltersAndSort(allReviews);
    const pageCount = Math.ceil(reviews.length / itemsPerPage);
    
    paginationContainer.innerHTML = '';
    
    if (pageCount <= 1) {
        return;
    }

    // Previous button
    paginationContainer.innerHTML += `
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

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
    paginationContainer.innerHTML += `
        <button class="page-btn ${currentPage === pageCount ? 'disabled' : ''}" 
                ${currentPage === pageCount ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
}

// Change page
function changePage(newPage) {
    currentPage = newPage;
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm) {
        const filteredReviews = filterReviews(searchTerm);
        displayReviews(filteredReviews);
    } else {
        displayReviews();
    }
}

// Toggle filter/sort menus
function toggleMenu(menu) {
    const allMenus = document.querySelectorAll('.filter-menu');
    allMenus.forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.filter-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Event listeners for filter and sort buttons
filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(filterMenu);
});

sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(sortMenu);
});

// Apply filters
applyFilterBtn.addEventListener('click', async () => {
    const ratingCheckboxes = filterMenu.querySelectorAll('input[type="checkbox"][value]');
    activeFilters.ratings = [...ratingCheckboxes]
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    currentPage = 1;
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        const filteredReviews = await filterReviews(searchTerm);
        await displayReviews(filteredReviews);
    } else {
        await displayReviews();
    }
    filterMenu.classList.remove('show');
});

// Apply sort
applySortBtn.addEventListener('click', async () => {
    const selectedSort = sortMenu.querySelector('input[name="sort"]:checked');
    activeSort = selectedSort ? selectedSort.value : null;
    
    currentPage = 1;
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        const filteredReviews = await filterReviews(searchTerm);
        await displayReviews(filteredReviews);
    } else {
        await displayReviews();
    }
    sortMenu.classList.remove('show');
});

// Search functionality with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        
        if (searchTerm) {
            const filteredReviews = await filterReviews(searchTerm);
            await displayReviews(filteredReviews);
        } else {
            await displayReviews();
        }
    }, 300);
});

// Initialize the page
fetchReviews();