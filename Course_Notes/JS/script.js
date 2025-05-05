// Show loading state
const itemList = document.getElementById('item-list');
itemList.innerHTML = '<div class="loading-spinner"></div>';

// Fetch the course data from the PHP backend
fetch('https://PHP-MySQL.XMo2.repl.co/getNotes.php')
  .then(response => response.json())
  .then(result => {
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch notes');
    }
    
    const courses = result.data;
    const pagination = document.querySelector('.pagination');
    let currentPage = 1;
    const itemsPerPage = 6;
    let filteredCourses = [...courses];
    let isLoading = false;
    let currentSearchTerm = '';

    // Function to apply filters to courses
    function applyFilters(coursesToFilter, selectedFilters) {
      if (selectedFilters.length === 0) return coursesToFilter;
      
      return coursesToFilter.filter(course => {
        const courseTag = course['item-tag'];
        return selectedFilters.some(filter => {
          if (filter === 'Science') {
            return ['Physics', 'Chemistry', 'Biology', 'Environmental Science'].includes(courseTag);
          } else if (filter === 'Engineering') {
            return ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Computer Engineering', 'Aerospace Engineering'].includes(courseTag);
          } else if (filter === 'Medical') {
            return ['Medicine', 'Nursing', 'Pharmacy', 'Dentistry'].includes(courseTag);
          } else if (filter === 'Arts') {
            return ['History', 'Philosophy', 'Art', 'Linguistics', 'Sociology', 'Anthropology'].includes(courseTag);
          } else if (filter === 'Business') {
            return ['Business', 'Economics', 'Marketing', 'Finance'].includes(courseTag);
          } else {
            return courseTag === filter;
          }
        });
      });
    }

    // Function to apply search to courses
    function applySearch(coursesToSearch, searchTerm) {
      if (!searchTerm) return coursesToSearch;
      
      return coursesToSearch.filter(course => {
        const title = course['item-title'].toLowerCase();
        const tag = course['item-tag'].toLowerCase();
        const desc = course['item-desc'].toLowerCase();
        
        return title.includes(searchTerm) || 
               tag.includes(searchTerm) || 
               desc.includes(searchTerm);
      });
    }

    // Function to update results based on both search and filters
    function updateResults() {
      const selectedFilters = Array.from(document.querySelectorAll('.filter-menu input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
      
      // First apply filters to all courses
      let results = applyFilters(courses, selectedFilters);
      // Then apply search to filtered results
      results = applySearch(results, currentSearchTerm);
      
      filteredCourses = results;
      currentPage = 1;
      renderPage(currentPage);
      renderPagination();
    }

    // Add search functionality
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', async (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      
      showLoading();
      // Simulate network delay for search
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateResults();
      hideLoading();
    });

    function showLoading() {
      isLoading = true;
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
      itemList.appendChild(loadingOverlay);
    }

    function hideLoading() {
      isLoading = false;
      const loadingOverlay = itemList.querySelector('.loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.remove();
      }
    }

    function renderPage(page, coursesToRender = filteredCourses) {
      itemList.innerHTML = '';
      const startIdx = (page - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const pageCourses = coursesToRender.slice(startIdx, endIdx);
      
      pageCourses.forEach(course => {
        const courseCard = document.createElement('article');
        courseCard.classList.add('item-card');
        courseCard.innerHTML = `
          <div class="item-content">
            <div class="item-meta">
              <span class="item-tag">${course['item-tag']}</span>
              <span class="item-date">Updated: ${course['item-date']}</span>
            </div>
            <h2 class="item-title">${course['item-title']}</h2>
            <p class="item-desc">${course['item-desc']}</p>
            <a href="view-notes.html?id=${course.id}" class="module-link">View Notes <i class="fas fa-arrow-right"></i></a>
          </div>
        `;
        itemList.appendChild(courseCard);
      });
    }

    function renderPagination(coursesToPaginate = filteredCourses) {
      const totalPages = Math.ceil(coursesToPaginate.length / itemsPerPage);
      pagination.innerHTML = '';
      
      // Always show page 1 if there are any items
      if (coursesToPaginate.length > 0) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (currentPage === 1 ? ' active' : '');
        btn.textContent = '1';
        btn.addEventListener('click', () => {
          currentPage = 1;
          renderPage(currentPage, coursesToPaginate);
          renderPagination(coursesToPaginate);
        });
        pagination.appendChild(btn);
        
        // Only show additional pages if there are more than itemsPerPage items
        if (totalPages > 1) {
          for (let i = 2; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
            btn.textContent = i;
            btn.addEventListener('click', () => {
              currentPage = i;
              renderPage(currentPage, coursesToPaginate);
              renderPagination(coursesToPaginate);
            });
            pagination.appendChild(btn);
          }
        }
      }
    }

    // Initial render
    renderPage(currentPage);
    renderPagination();

    // Sort functionality
    const sortButton = document.querySelector('#sortButton');
    const sortMenu = document.querySelector('.sort-menu');

    // Toggle sort menu
    sortButton.addEventListener('click', (event) => {
      event.stopPropagation();
      sortMenu.style.display = sortMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      sortMenu.style.display = 'none';
      filterMenu.style.display = 'none';
    });

    // Prevent menus from closing when clicking inside
    sortMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Handle sort selection
    document.querySelectorAll('.sort-menu input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', async (event) => {
        const sortType = event.target.value;
        
        showLoading();
        // Simulate network delay for sorting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        switch(sortType) {
          case 'recent':
            filteredCourses.sort((a, b) => new Date(b['item-date']) - new Date(a['item-date']));
            break;
          case 'alphabetical':
            filteredCourses.sort((a, b) => a['item-title'].localeCompare(b['item-title']));
            break;
          case 'subject':
            filteredCourses.sort((a, b) => a['item-tag'].localeCompare(b['item-tag']));
            break;
        }
        
        // Re-render with sorted filtered courses
        currentPage = 1;
        renderPage(currentPage);
        renderPagination();
        hideLoading();
        
        // Close sort menu
        sortMenu.style.display = 'none';
      });
    });

    // Filter functionality
    const filterButton = document.querySelector('#filterButton');
    const filterMenu = document.querySelector('.filter-menu');
    const applyFilterBtn = document.querySelector('.apply-filter-btn');

    // Toggle filter menu
    filterButton.addEventListener('click', (event) => {
      event.stopPropagation();
      filterMenu.style.display = filterMenu.style.display === 'block' ? 'none' : 'block';
    });

    filterMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Apply filters
    applyFilterBtn.addEventListener('click', async () => {
      showLoading();
      
      // Simulate network delay for filtering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateResults();
      hideLoading();
      
      // Close the filter menu
      filterMenu.style.display = 'none';
    });
  })
  .catch(error => {
    console.error('Error fetching course data:', error);
    itemList.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <p style="color: var(--secondary-text);">Error loading courses. Please try again later.</p>
      </div>
    `;
  });
