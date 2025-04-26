// Loading state element and constants
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading events...';

const updateLoadingIndicator = document.createElement('div');
updateLoadingIndicator.className = 'update-loading-indicator';
updateLoadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating results...';

const EVENTS_PER_PAGE = 6;
let currentPage = 1;
let allEvents = [];
let filterTags = [];
let activeFilters = [];
let activeSort = 'date-desc';
let searchTerm = '';

function toggleMenu(menuId, btnId) {
    const menu = document.getElementById(menuId);
    const btn = document.getElementById(btnId);
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        // Hide any other open menu
        document.querySelectorAll('.filter-menu, .sort-menu').forEach(m => m.style.display = 'none');
        menu.style.display = 'block';
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function handler(e) {
                if (!menu.contains(e.target) && e.target !== btn) {
                    menu.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            });
        }, 10);
    }
}

async function fetchEvents() {
    const eventContainer = document.getElementById('event-container');
    if (!eventContainer) return;

    eventContainer.appendChild(loadingIndicator);

    try {
        let events;
        try {
            const localResponse = await fetch('../js/cv.json');
            events = await localResponse.json();
        } catch (localError) {
            const apiResponse = await fetch('https://680cd8a62ea307e081d53532.mockapi.io/event');
            events = await apiResponse.json();
        }

        allEvents = events;
        // Get unique tags for filter
        filterTags = Array.from(new Set(allEvents.map(ev => ev['item-tag']).filter(Boolean)));
        renderFilterMenu();
        loadingIndicator.remove();
        renderEvents(currentPage);
        setupPagination();

    } catch (error) {
        console.error('Error fetching events:', error);
        loadingIndicator.innerHTML = 'Error loading events. Please try again later.';
        loadingIndicator.style.color = 'red';
    }
}

function renderFilterMenu() {
    const filterMenu = document.getElementById('filter-menu');
    if (!filterMenu) return;
    
    const checkboxes = filterTags.map(tag =>
        `<label><input type="checkbox" name="tag" value="${tag}"> ${tag}</label><br>`
    ).join('');
    
    filterMenu.innerHTML = checkboxes + 
        '<button id="apply-filter-btn" class="add-new-btn" style="margin-top:8px;">Apply</button>';
}

async function renderEvents(page) {
    const eventContainer = document.getElementById('event-container');
    eventContainer.innerHTML = '';
    
    // Show update loading indicator
    eventContainer.appendChild(updateLoadingIndicator);

    // Simulate a small delay for the loading state to be visible
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredEvents = allEvents;
    
    // Apply search
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
            event['item-title'].toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Apply filters
    if (activeFilters.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
            activeFilters.includes(event['item-tag'])
        );
    }

    // Apply sorting
    filteredEvents = filteredEvents.slice().sort((a, b) => {
        switch (activeSort) {
            case 'date-asc':
                return new Date(a['item-date']) - new Date(b['item-date']);
            case 'date-desc':
                return new Date(b['item-date']) - new Date(a['item-date']);
            case 'title-asc':
                return a['item-title'].localeCompare(b['item-title']);
            case 'title-desc':
                return b['item-title'].localeCompare(a['item-title']);
            default:
                return 0;
        }
    });

    // Remove loading indicator
    updateLoadingIndicator.remove();

    // If no results found, show message
    if (filteredEvents.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <p style="text-align: center; color: var(--secondary-text); padding: 2rem;">
                No events found${searchTerm ? ` matching "${searchTerm}"` : ''}.
            </p>
        `;
        eventContainer.appendChild(noResults);
        // Hide pagination when no results
        const pagination = document.querySelector('.pagination');
        if (pagination) pagination.style.display = 'none';
        return;
    }

    // Show pagination
    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.style.display = 'flex';

    const startIndex = (page - 1) * EVENTS_PER_PAGE;
    const endIndex = startIndex + EVENTS_PER_PAGE;
    const eventsToShow = filteredEvents.slice(startIndex, endIndex);

    eventsToShow.forEach((event, index) => {
        const eventCard = document.createElement('article');
        eventCard.className = 'item-card animate-fadeIn';
        eventCard.style.animationDelay = `${index * 0.1}s`;

        eventCard.innerHTML = `
            <div class="item-content">
                <div class="item-meta">
                    <span class="item-tag">${event['item-tag']}</span>
                    <span class="item-date">${new Date(event['item-date']).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
                <h2 class="item-title">${event['item-title']}</h2>
                <p class="item-desc">${event['item-short-desc']}</p>
                <a href="event-ChineseCultural.html?title=${encodeURIComponent(event['item-title'])}" class="module-link">View Details <i class="fas fa-arrow-right"></i></a>
            </div>
        `;

        eventContainer.appendChild(eventCard);
    });

    // Update pagination
    setupPagination(Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
}

function setupPagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderEvents(currentPage);
        }
    });
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderEvents(currentPage);
        });
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderEvents(currentPage);
        }
    });
    pagination.appendChild(nextBtn);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();

    // Add search input handler
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                searchTerm = e.target.value.trim();
                currentPage = 1;
                renderEvents(currentPage);
            }, 300); // Debounce search for better performance
        });
    }

    const filterBtn = document.getElementById('filter-btn');
    const sortBtn = document.getElementById('sort-btn');

    filterBtn?.addEventListener('click', e => {
        e.stopPropagation();
        toggleMenu('filter-menu', 'filter-btn');
    });

    sortBtn?.addEventListener('click', e => {
        e.stopPropagation();
        toggleMenu('sort-menu', 'sort-btn');
    });

    // Handle filter apply
    document.body.addEventListener('click', e => {
        if (e.target && e.target.id === 'apply-filter-btn') {
            const checked = Array.from(document.querySelectorAll('#filter-menu input[type=checkbox]:checked'));
            activeFilters = checked.map(cb => cb.value);
            currentPage = 1;
            renderEvents(currentPage);
            document.getElementById('filter-menu').style.display = 'none';
        }
    });

    // Handle sort apply
    document.getElementById('apply-sort-btn')?.addEventListener('click', () => {
        const selected = document.querySelector('#sort-menu input[type=radio]:checked');
        activeSort = selected ? selected.value : 'date-desc';
        currentPage = 1;
        renderEvents(currentPage);
        document.getElementById('sort-menu').style.display = 'none';
    });
});