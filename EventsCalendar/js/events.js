// Loading state element
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading events...';

// Constants
const EVENTS_PER_PAGE = 6;
let currentPage = 1;
let allEvents = [];

async function fetchEvents() {
    const eventContainer = document.getElementById('event-container');
    if (!eventContainer) return;

    // Show loading state
    eventContainer.appendChild(loadingIndicator);

    try {
        // Try local JSON first
        let events;
        try {
            const localResponse = await fetch('../js/cv.json');
            events = await localResponse.json();
        } catch (localError) {
            // If local JSON fails, try the API
            const apiResponse = await fetch('https://680cd8a62ea307e081d53532.mockapi.io/event');
            events = await apiResponse.json();
        }

        // Store all events globally
        allEvents = events.sort((a, b) => new Date(b['item-date']) - new Date(a['item-date']));

        // Remove loading indicator
        loadingIndicator.remove();

        // Initialize pagination
        renderEvents(currentPage);
        setupPagination();

    } catch (error) {
        console.error('Error fetching events:', error);
        loadingIndicator.innerHTML = 'Error loading events. Please try again later.';
        loadingIndicator.style.color = 'red';
    }
}

function renderEvents(page) {
    const eventContainer = document.getElementById('event-container');
    eventContainer.innerHTML = ''; // Clear existing events

    const startIndex = (page - 1) * EVENTS_PER_PAGE;
    const endIndex = startIndex + EVENTS_PER_PAGE;
    const eventsToShow = allEvents.slice(startIndex, endIndex);

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
}

function setupPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(allEvents.length / EVENTS_PER_PAGE);
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
            setupPagination();
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
            setupPagination();
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
            setupPagination();
        }
    });
    pagination.appendChild(nextBtn);
}

// Call fetchEvents when the DOM is loaded
document.addEventListener('DOMContentLoaded', fetchEvents);