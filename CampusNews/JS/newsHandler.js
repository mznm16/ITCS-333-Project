let currentPage = 1;
const itemsPerPage = 6;
let newsData = [];
let originalNewsData = []; // Store original data for resetting filters
let activeFilters = new Set(); // Store active tag filters

// Fetch news data from the API
async function fetchNews() {
    showLoading();
    try {
        const response = await fetch('https://680cee342ea307e081d57b57.mockapi.io/news');
        newsData = await response.json();
        originalNewsData = [...newsData]; // Keep a copy of original data
        setupFilterOptions(); // Set up filter options based on available tags
        displayNews(currentPage);
        setupPagination();
    } catch (error) {
        console.error('Error fetching news:', error);
        document.querySelector('.item-list').innerHTML = '<p>Error loading news. Please try again later.</p>';
    } finally {
        hideLoading();
    }
}

// Set up filter options
function setupFilterOptions() {
    const tags = new Set(originalNewsData.map(news => news['news-tag']));
    const filterMenu = document.querySelector('.filter-menu');
    filterMenu.innerHTML = Array.from(tags).map(tag => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${tag}" id="filter-${tag}">
            <label class="form-check-label" for="filter-${tag}">${tag}</label>
        </div>
    `).join('') + `
    <div class="filter-actions mt-3">
        <button class="btn btn-primary btn-sm" onclick="applyFilters()">Apply Filters</button>
        <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Reset</button>
    </div>`;
}

// Apply filters
function applyFilters() {
    showLoading();
    setTimeout(() => {
        const checkedFilters = document.querySelectorAll('.filter-menu input:checked');
        activeFilters = new Set(Array.from(checkedFilters).map(input => input.value));
        
        if (activeFilters.size > 0) {
            newsData = originalNewsData.filter(news => activeFilters.has(news['news-tag']));
        } else {
            newsData = [...originalNewsData];
        }
        
        // Apply current sort if any
        const sortSelect = document.querySelector('#sortSelect');
        if (sortSelect) {
            applySorting(sortSelect.value, false);
        }
        
        currentPage = 1;
        displayNews(currentPage);
        setupPagination();
        document.querySelector('.filter-menu').classList.remove('show');
        hideLoading();
    }, 300); // Small delay to show loading state
}

// Reset filters
function resetFilters() {
    document.querySelectorAll('.filter-menu input').forEach(input => input.checked = false);
    activeFilters.clear();
    newsData = [...originalNewsData];
    
    // Apply current sort if any
    const sortSelect = document.querySelector('#sortSelect');
    if (sortSelect) {
        applySorting(sortSelect.value);
    }
    
    currentPage = 1;
    displayNews(currentPage);
    setupPagination();
    document.querySelector('.filter-menu').classList.remove('show');
}

// Apply sorting
function applySorting(sortType, showLoadingState = true) {
    if (showLoadingState) showLoading();
    
    setTimeout(() => {
        switch (sortType) {
            case 'date-new':
                newsData.sort((a, b) => new Date(b['news-date']) - new Date(a['news-date']));
                break;
            case 'date-old':
                newsData.sort((a, b) => new Date(a['news-date']) - new Date(b['news-date']));
                break;
            case 'alpha-asc':
                newsData.sort((a, b) => a['news-title'].localeCompare(b['news-title']));
                break;
            case 'alpha-desc':
                newsData.sort((a, b) => b['news-title'].localeCompare(a['news-title']));
                break;
        }
        currentPage = 1;
        displayNews(currentPage);
        setupPagination();
        document.querySelector('.sort-menu').classList.remove('show');
        if (showLoadingState) hideLoading();
    }, 300); // Small delay to show loading state
}

// Toggle menu visibility
function toggleMenu(menuClass) {
    const menu = document.querySelector('.' + menuClass);
    const otherMenu = menuClass === 'filter-menu' ? '.sort-menu' : '.filter-menu';
    document.querySelector(otherMenu).classList.remove('show');
    menu.classList.toggle('show');
}

// Display news for the current page
function displayNews(page) {
    const itemList = document.querySelector('.item-list');
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = newsData.slice(startIndex, endIndex);

    itemList.innerHTML = pageItems.map((news, index) => `
        <article class="item-card">
            <div class="item-content">
                <div class="item-meta">
                    <span class="item-tag">${news['news-tag']}</span>
                    <span class="item-date">${formatDate(news['news-date'])}</span>
                </div>
                <h2 class="item-title">${news['news-title']}</h2>
                <p class="item-desc">${news['news-short-desc']}</p>
                <a href="view-news.html?id=${startIndex + index + 1}" class="module-link">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `).join('');
}

// Format date to a more readable format
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Set up pagination buttons
function setupPagination() {
    const totalPages = Math.ceil(newsData.length / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active" onclick="changePage(${i})">${i}</button>`;
        } else if (i <= 3 || i > totalPages - 2 || Math.abs(i - currentPage) <= 1) {
            paginationHTML += `<button class="page-btn" onclick="changePage(${i})">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 2) {
            paginationHTML += `<button class="page-btn"><i class="fas fa-ellipsis-h"></i></button>`;
            i = i < currentPage ? currentPage - 1 : totalPages - 2;
        }
    }

    // Next button
    paginationHTML += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
    </button>`;

    pagination.innerHTML = paginationHTML;
}

// Change page function
function changePage(page) {
    if (page < 1 || page > Math.ceil(newsData.length / itemsPerPage)) return;
    currentPage = page;
    displayNews(currentPage);
    setupPagination();
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-controls')) {
            document.querySelector('.filter-menu').classList.remove('show');
            document.querySelector('.sort-menu').classList.remove('show');
        }
    });
});

// Search functionality
const searchInput = document.querySelector('.search-input');
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    showLoading();
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm) {
            newsData = originalNewsData.filter(news => 
                news['news-title'].toLowerCase().includes(searchTerm) ||
                news['news-short-desc'].toLowerCase().includes(searchTerm) ||
                news['news-tag'].toLowerCase().includes(searchTerm)
            );
        } else {
            newsData = [...originalNewsData];
        }
        currentPage = 1;
        displayNews(currentPage);
        setupPagination();
        hideLoading();
    }, 500); // Debounce delay
});

function showLoading() {
    const itemList = document.querySelector('.item-list');
    itemList.classList.add('loading');
    itemList.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading news...</p>
        </div>
    `;
}

function hideLoading() {
    const itemList = document.querySelector('.item-list');
    itemList.classList.remove('loading');
}