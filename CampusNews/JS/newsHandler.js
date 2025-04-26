let currentPage = 1;
const itemsPerPage = 6;
let newsData = [];

// Fetch news data from the API
async function fetchNews() {
    try {
        const response = await fetch('https://680cee342ea307e081d57b57.mockapi.io/news');
        newsData = await response.json();
        displayNews(currentPage);
        setupPagination();
    } catch (error) {
        console.error('Error fetching news:', error);
        document.querySelector('.item-list').innerHTML = '<p>Error loading news. Please try again later.</p>';
    }
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
document.addEventListener('DOMContentLoaded', fetchNews);

// Search functionality
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm) {
        const filteredNews = newsData.filter(news => 
            news['news-title'].toLowerCase().includes(searchTerm) ||
            news['news-short-desc'].toLowerCase().includes(searchTerm) ||
            news['news-tag'].toLowerCase().includes(searchTerm)
        );
        newsData = filteredNews;
    } else {
        fetchNews(); // Reset to original data
    }
    currentPage = 1;
    displayNews(currentPage);
    setupPagination();
});