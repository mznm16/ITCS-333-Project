const API_URL = 'https://6809eb641f1a52874cde5938.mockapi.io/GroupName';
const GROUPS_PER_PAGE = 15;

let studyGroups = [];
let currentPage = 1;
let currentSort = 'name'; // Default sort

//categoriess
const courseMapping = {
    'it': [
        { value: 'itcs333', text: 'ITCS 333 - Internet Web Development' },
        { value: 'itcs314', text: 'ITCS 314 - Network Security' },
        { value: 'itcs316', text: 'ITCS 316 - Human Computer Interaction' },
        { value: 'itcs214', text: 'ITCS 214 - Data Structures' },
        { value: 'itcs321', text: 'ITCS 321 - Assembly Language' }
    ],
    'engineering': [
        { value: 'eng101', text: 'ENG 101 - Engineering Mathematics' },
        { value: 'eng102', text: 'ENG 102 - Engineering Physics' },
        { value: 'eng103', text: 'ENG 103 - Engineering Drawing' },
        { value: 'eng104', text: 'ENG 104 - Engineering Mechanics' }
    ],
    'science': [
        { value: 'phys101', text: 'PHYS 101 - General Physics' },
        { value: 'chem101', text: 'CHEM 101 - General Chemistry' },
        { value: 'math101', text: 'MATH 101 - Calculus I' },
        { value: 'bio101', text: 'BIO 101 - General Biology' }
    ],
    'health': [
        { value: 'hss101', text: 'HSS 101 - Human Anatomy' },
        { value: 'hss102', text: 'HSS 102 - Sports Science' },
        { value: 'hss103', text: 'HSS 103 - Health Education' }
    ],
    'business': [
        { value: 'bus101', text: 'BUS 101 - Introduction to Business' },
        { value: 'bus102', text: 'BUS 102 - Accounting Principles' },
        { value: 'bus103', text: 'BUS 103 - Business Statistics' },
        { value: 'bus104', text: 'BUS 104 - Marketing Principles' }
    ],
    'law': [
        { value: 'law101', text: 'LAW 101 - Introduction to Law' },
        { value: 'law102', text: 'LAW 102 - Constitutional Law' },
        { value: 'law103', text: 'LAW 103 - Criminal Law' }
    ],
    'arts': [
        { value: 'art101', text: 'ART 101 - Art History' },
        { value: 'art102', text: 'ART 102 - Drawing Fundamentals' },
        { value: 'art103', text: 'ART 103 - Design Principles' }
    ]
};

function applyAllFilters() {
    let filtered = [...studyGroups];
    // Tab filter
    const currentTab = document.querySelector('.nav-link.active');
    const tabId = currentTab ? currentTab.getAttribute('data-bs-target').substring(1) : 'search';
    filtered = filterGroupsByTab(filtered, tabId);
    // Search filter
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(group =>
            group.title.toLowerCase().includes(searchTerm) ||
            group.course.toLowerCase().includes(searchTerm) ||
            group.description.toLowerCase().includes(searchTerm)
        );
    }
    // Category filter
    const selectedCategory = window.filterCategory ? window.filterCategory.value : '';
    if (selectedCategory) {
        filtered = filtered.filter(group => group.category === selectedCategory);
    }
    // Course filter
    const selectedCourse = window.filterCourse ? window.filterCourse.value : '';
    if (selectedCourse) {
        filtered = filtered.filter(group => group.course === selectedCourse);
    }
    // Sort
    filtered = sortGroups(filtered, currentSort);
    currentPage = 1;
    displayGroups(filtered);
}

function showLoading() {
    const container = document.querySelector('.row.row-cols-1.row-cols-md-3');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading study groups...</p>
            </div>
        `;
    }
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function createGroupCard(group) {
    const isFull = group.currentMembers >= group.maxMembers;
    const membersHTML = Array(group.maxMembers).fill().map((_, i) => {
        const isActive = i < group.currentMembers;
        return `<i class="fas fa-user ${isActive ? 'text-success' : 'text-secondary'} me-2 mb-2"></i>`;
    }).join('');

    const joinButton = isFull 
        ? '<button class="btn" style="background-color: rgb(255, 0, 0); color: white;" disabled>Group is Full</button>'
        : group.Joined
            ? '<button class="btn btn-success" disabled><i class="fas fa-check me-2"></i>Joined</button>'
            : `<button class="btn btn-success" onclick="joinGroup('${group.id}')"><i class="fas fa-user-plus me-2"></i>Join</button>`;
           
    // Add edit and delete buttons only if user is the owner
    const ownerButtons = group.Owner
        ? `
            <div class="d-flex justify-content-right gap-2 mt-3">
                <button class="btn btn-outline-danger" onclick="deleteGroup('${group.id}')">
                    <i class="fas fa-trash me-2"></i>Delete
                </button>
            </div>
        `
        : '';

    return `
        <div class="col mb-4">
            <div class="card shadow-sm">
                <a href="view-group.html?id=${group.id}">
                    <img src="${group.image || '../images/newcs.jpg'}" class="card-img-top">
                </a>
                <div class="card-header position-relative">
                    <h5 class="card-title">${group.title}</h5>
                </div>
                <span class="badge bg-primary position-absolute top-0 start-0 m-2">${group.course}</span>
                <div class="card-body">
                    <p class="card-text">${group.description}</p>
                    <div class="d-flex align-items-center">
                        <span class="me-2">Members:</span>
                        <div class="d-flex">
                            ${membersHTML}
                        </div>
                    </div>
                    <br>
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="view-group.html?id=${group.id}" class="btn btn-primary">View Group</a>
                        ${joinButton}
                    </div>
                    ${ownerButtons}
                </div>
            </div>
        </div>
    `;
}

function createPagination(totalPages) {
    let paginationHTML = `
        <div class="pagination justify-content-center mt-4">
            <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `
                <button class="page-btn disabled">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            `;
        }
    }

    paginationHTML += `
            <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    return paginationHTML;
}

function displayGroups(groups) {
    const container = document.querySelector('.row.row-cols-1.row-cols-md-3');
    const paginationContainer = document.querySelector('.pagination');
    if (!container) return;

    const startIndex = (currentPage - 1) * GROUPS_PER_PAGE;
    const endIndex = startIndex + GROUPS_PER_PAGE;
    const paginatedGroups = groups.slice(startIndex, endIndex);
    const totalPages = Math.ceil(groups.length / GROUPS_PER_PAGE);

    let groupsHTML = paginatedGroups.map(createGroupCard).join('');
    container.innerHTML = groupsHTML;
    if (paginationContainer) {
        paginationContainer.innerHTML = createPagination(totalPages);
    }
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(studyGroups.length / GROUPS_PER_PAGE)) return;
    currentPage = page;
    displayGroups(studyGroups);
    // Scroll to the top of the page
    window.scrollTo({
        top: 200,
        behavior: 'smooth'
    });
}

function filterGroups(searchTerm) {
    const filtered = studyGroups.filter(group => {
        const searchLower = searchTerm.toLowerCase();
        return group.title.toLowerCase().includes(searchLower) ||
               group.course.toLowerCase().includes(searchLower) ||
               group.description.toLowerCase().includes(searchLower);
    });
    
    currentPage = 1;
    displayGroups(filtered);
}

function filterGroupsByTab(groups, tabId) {
    switch (tabId) {
        case 'search':
            return groups; // Show all groups in search tab
        case 'joined':
            return groups.filter(group => group.Joined && !group.Owner);
        case 'my-groups':
            return groups.filter(group => group.Joined && group.Owner);
        default:
            return groups;
    }
}

function selectTab(tabButton) {
    // Remove active class from all tabs
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
    });
    // Add active class to clicked tab
    tabButton.classList.add('active');
    // Get the tab content ID
    const tabId = tabButton.getAttribute('data-bs-target').substring(1);
    // Reapply all filters (tab, search, filter dropdowns)
    if (typeof applyAllFilters === 'function') {
        applyAllFilters();
    } else {
        // fallback: just filter by tab
        const filteredGroups = filterGroupsByTab(studyGroups, tabId);
        currentPage = 1;
        displayGroups(filteredGroups);
    }
}

function sortGroups(groups, sortBy) {
    const sorted = [...groups];
    if (sortBy === 'name') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'members') {
        sorted.sort((a, b) => (b.currentMembers || 0) - (a.currentMembers || 0));
    } else if (sortBy === 'date') {
        // If createdAt is not present, fallback to original order
        sorted.sort((a, b) => {
            const aDate = a.createdAt ? new Date(a.createdAt) : 0;
            const bDate = b.createdAt ? new Date(b.createdAt) : 0;
            return bDate - aDate;
        });
    }
    return sorted;
}

async function loadStudyGroups() {
    try {
        showLoadingOverlay();
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        studyGroups = await response.json();
        displayGroups(studyGroups);
    } catch (error) {
        console.error('Error loading study groups:', error);
        const container = document.querySelector('.row.row-cols-1.row-cols-md-3');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Failed to load study groups. Please try again later.</p>
                    <button class="btn btn-primary mt-2" onclick="loadStudyGroups()">Retry</button>
                </div>
            `;
        }
    } finally {
        hideLoadingOverlay();
    }
}

function addResourceField() {
    const container = document.getElementById('resourcesContainer');
    const newResource = document.createElement('div');
    newResource.className = 'resource-item mb-3';
    newResource.innerHTML = `
        <div class="row">
            <div class="col-md-4 mb-2">
                <label class="form-label">Resource Type</label>
                <select class="form-select resource-type">
                    <option value="pdf">PDF Document</option>
                    <option value="link">External Link</option>
                    <option value="video">Video</option>
                </select>
            </div>
            <div class="col-md-8 mb-2">
                <label class="form-label">Resource Title</label>
                <input type="text" class="form-control resource-title" placeholder="Enter resource title">
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 mb-2">
                <label class="form-label">Resource URL/File</label>
                <div class="input-group">
                    <input type="text" class="form-control resource-url" placeholder="Enter URL or upload file">
                    <button class="btn btn-outline-secondary" type="button">
                        <i class="fas fa-upload"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <label class="form-label">Description</label>
                <textarea class="form-control resource-description" rows="2" placeholder="Brief description of the resource"></textarea>
            </div>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm mt-2" onclick="this.parentElement.remove()">
            <i class="fas fa-trash me-2"></i>Remove Resource
        </button>
    `;
    container.appendChild(newResource);
}

function getResources() {
    const resources = [];
    const resourceItems = document.querySelectorAll('.resource-item');
    
    resourceItems.forEach(item => {
        const type = item.querySelector('.resource-type').value;
        const title = item.querySelector('.resource-title').value;
        const url = item.querySelector('.resource-url').value;
        const description = item.querySelector('.resource-description').value;
        
        if (title && url) { // Only add if both title and URL are provided
            resources.push({
                type,
                title,
                url,
                description,
                lastUpdated: new Date().toISOString()
            });
        }
    });
    
    return resources;
}

async function submitGroupForm() {
    const groupName = document.getElementById('groupName').value;
    const category = document.getElementById('category').value;
    const course = document.getElementById('courseSelect').value;
    const meetingTime = document.getElementById('meetingTime').value;
    const location = document.getElementById('location').value;
    const maxMembers = document.getElementById('maxMembers').value;
    const description = document.getElementById('description').value;
    
    // Get selected days
    const selectedDays = Array.from(document.querySelectorAll('.day-btn.active'))
        .map(btn => btn.dataset.day);
    
    // Get selected requirements
    const requirements = [
        document.getElementById('reqLaptop').checked ? 'laptop' : null,
        document.getElementById('reqNotes').checked ? 'notes' : null,
        document.getElementById('reqHeadphones').checked ? 'headphones' : null
    ].filter(Boolean); // Remove null values

    if (!groupName || !category || !course || !meetingTime || !location || !maxMembers || !description || selectedDays.length === 0) {
        alert('Please fill in all required fields');
        return;
    }

    // List of available images (more images will be added later)
    const availableImages = [
   
        
    
        '../images/newcs.jpg',

    ];

    // Randomly select an image
    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];

    const groupData = {
        title: groupName,
        category: category,
        course: course,
        description: description,
        maxMembers: parseInt(maxMembers),
        currentMembers: 1,
        meetingTime: new Date(`1970-01-01T${meetingTime}`).getTime() / 1000,
        location: location,
        Days: selectedDays,
        requirements: requirements,
        resources: getResources(),
        Joined: true,
        Owner: true,
        image: randomImage
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });

        if (!response.ok) {
            throw new Error('Failed to create group');
        }

        const createdGroup = await response.json();
        console.log('Created group:', createdGroup);
        alert('Group created successfully!');
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createGroupModal'));
        modal.hide();

        // Reset the form
        document.getElementById('createGroupForm').reset();
        
        // Reload the groups to show the new one
        loadStudyGroups();
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Failed to create group. Please try again.');
    }
}

async function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
        try {
            const response = await fetch(`${API_URL}/${groupId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete group');
            }

            alert('Group deleted successfully!');
            loadStudyGroups(); // Reload the groups list
        } catch (error) {
            console.error('Error deleting group:', error);
            alert('Failed to delete group. Please try again.');
        }
    }
}

// joinGroup function for both main and group view pages
async function joinGroup(groupId) {
    try {
        const response = await fetch(`${API_URL}/${groupId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        if (group.currentMembers >= group.maxMembers) {
            alert('This group is already full');
            return;
        }

        const updatedGroup = {
            ...group,
            Joined: true,
            currentMembers: group.currentMembers + 1
        };

        const updateResponse = await fetch(`${API_URL}/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedGroup)
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to join group');
        }

        alert(`You joined the group: ${group.title}`);
        // Reload the groups to show the updated state
        if (typeof loadStudyGroups === 'function') {
            loadStudyGroups();
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Failed to join group. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadStudyGroups();

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            applyAllFilters();
        });
    }

    const resetBtn = document.querySelector('.btn-secondary');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            currentPage = 1;
            displayGroups(studyGroups);
            if (searchInput) searchInput.value = '';
        });
    }

    // Filter dropdowns (assign to window for global access)
    window.filterCategory = document.getElementById('filterCategory');
    window.filterCourse = document.getElementById('filterCourse');
    window.applyFilterBtn = document.getElementById('applyFilterBtn');
    window.clearFilterBtn = document.getElementById('clearFilterBtn');

    // Populate filterCourse based on filterCategory
    function updateFilterCourseOptions() {
        const selectedCategory = window.filterCategory.value;
        // Clear existing options except the first one
        while (window.filterCourse.options.length > 1) {
            window.filterCourse.remove(1);
        }
        if (selectedCategory && courseMapping[selectedCategory]) {
            courseMapping[selectedCategory].forEach(course => {
                const option = new Option(course.text, course.value);
                window.filterCourse.add(option);
            });
        }
    }
    window.filterCategory.addEventListener('change', function() {
        updateFilterCourseOptions();
    });

    if (window.applyFilterBtn) {
        window.applyFilterBtn.addEventListener('click', function() {
            applyAllFilters();
        });
    }
    if (window.clearFilterBtn) {
        window.clearFilterBtn.addEventListener('click', function() {
            window.filterCategory.value = '';
            updateFilterCourseOptions();
            window.filterCourse.value = '';
            if (searchInput) searchInput.value = '';
            applyAllFilters();
        });
    }

    // Get the category and course select elements for create group
    const categorySelect = document.getElementById('category');
    const courseSelect = document.getElementById('courseSelect');

    // Function to update course options based on selected category (for create group)
    function updateCourseOptions() {
        const selectedCategory = categorySelect.value;
        // Clear existing options except the first one
        while (courseSelect.options.length > 1) {
            courseSelect.remove(1);
        }
        // If a category is selected, add its courses
        if (selectedCategory && courseMapping[selectedCategory]) {
            courseMapping[selectedCategory].forEach(course => {
                const option = new Option(course.text, course.value);
                courseSelect.add(option);
            });
        }
    }
    categorySelect.addEventListener('change', updateCourseOptions);

    // Initialize day selection buttons
    const dayButtons = document.querySelectorAll('.day-btn');
    const selectedDaysInput = document.getElementById('selectedDays');
    let selectedDays = [];

    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            const day = this.dataset.day;
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                selectedDays.push(day);
            } else {
                selectedDays = selectedDays.filter(d => d !== day);
            }
            selectedDaysInput.value = JSON.stringify(selectedDays);
        });
    });

    // Initialize Bootstrap components
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Ensure filterCourse is updated on page load if a category is pre-selected
    updateFilterCourseOptions();

    // Add sort event listeners
    const sortOptions = document.querySelectorAll('.sort-option');
    sortOptions.forEach(option => {
        option.addEventListener('click', function() {
            currentSort = this.getAttribute('data-sort');
            applyAllFilters();
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  mobileMenuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('active');
  });

//if clicked outside the navabar,,it will close
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.navbar')) {
      navLinks.classList.remove('active');
    }
  });
});
