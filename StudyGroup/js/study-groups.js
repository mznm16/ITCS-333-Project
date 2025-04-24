const API_URL = 'https://6809eb641f1a52874cde5938.mockapi.io/GroupName';
const GROUPS_PER_PAGE = 15;

let studyGroups = [];
let currentPage = 1;

function showLoading() {
  const container = document.querySelector('.row.row-cols-1.row-cols-md-3');
  if (container) {
    container.innerHTML = `
      <div class="col-12 d-flex flex-column justify-content-center align-items-center" style="min-height: 70vh;">
        <div class="spinner-border text-primary" role="status" style="width: 10rem; height: 10rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 fs-4">Loading study groups....</p>
      </div>
    `;
  }
}

function createGroupCard(group) {
  const isFull = group.members >= group.maxMembers;
  const membersHTML = Array(group.maxMembers).fill().map((_, i) => {
    const isActive = i < group.members;
    return `<i class="fas fa-user ${isActive ? 'text-success' : 'text-secondary'} me-2 mb-2"></i>`;
  }).join('');

  const joinButton = isFull 
    ? '<button class="btn" style="background-color: rgb(255, 0, 0); color: white;" disabled>Group is Full</button>'
    : `<a href="view-group.html?id=${group.id}" class="btn btn-success">Join</a>`;

  return `
    <div class="col mb-4">
      <div class="card shadow-sm">
        <a href="view-group.html?id=${group.id}">
          <img src="${group.image}" class="card-img-top">
        </a>
        <div class="card-header position-relative">
          <h5 class="card-title">${group.title}</h5>
        </div>
        <span class="badge bg-primary position-absolute top-0 start-0 m-2">${group.course || 'General'}</span>
        <div class="card-body">
          <p class="card-text">${group.description}</p>
          <div class="d-flex align-items-center">
            <span class="me-2">Members:</span>
            <div class="d-flex">
              ${membersHTML}
            </div>
          </div>
          <br>
          <div class="d-flex justify-content-between">
            <a href="view-group.html?id=${group.id}" class="btn btn-primary">View Group</a>
            ${joinButton}
          </div>
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

  container.innerHTML = paginatedGroups.map(createGroupCard).join('');
  
  if (paginationContainer) {
    paginationContainer.innerHTML = createPagination(totalPages);
  }
}

function changePage(page) {
  if (page < 1 || page > Math.ceil(studyGroups.length / GROUPS_PER_PAGE)) return;
  currentPage = page;
  displayGroups(studyGroups);
}

function filterGroups(searchTerm) {
  const filtered = studyGroups.filter(group => 
    group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.course && group.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  currentPage = 1;
  displayGroups(filtered);
}

async function loadStudyGroups() {
  try {
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
        <div class="col-12 d-flex flex-column justify-content-center align-items-center" style="min-height: 70vh;">
          <p class="text-danger fs-4">Failed to load study groups. Please try again later.</p>
          <p class="text-muted">Error: ${error.message}</p>
          <button class="btn btn-primary mt-2" onclick="loadStudyGroups()">Retry</button>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadStudyGroups();

  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      filterGroups(e.target.value);
    });
  }

  const filterBtn = document.querySelector('.btn-primary');
  if (filterBtn) {
    filterBtn.addEventListener('click', function() {
      alert('Filter functionality will be implemented in the next phase');
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
}); 