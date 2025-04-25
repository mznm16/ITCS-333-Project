// Show loading state
const itemList = document.getElementById('item-list');
itemList.innerHTML = '<div class="loading-spinner"></div>';

// Fetch the course data from the API
fetch('https://680baf23d5075a76d98c0d14.mockapi.io/courses')
  .then(response => response.json())
  .then(courses => {
    const pagination = document.querySelector('.pagination');
    let currentPage = 1;
    const itemsPerPage = 6;
    let filteredCourses = [...courses]; // Store filtered courses globally
    let isLoading = false;

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
      
      // Only show pagination if there's more than one page
      if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
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
      
      const selectedFilters = Array.from(document.querySelectorAll('.filter-menu input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
      
      // Simulate network delay for filtering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (selectedFilters.length === 0) {
        // If no filters selected, show all courses
        filteredCourses = [...courses];
      } else {
        // Filter courses based on selected tags
        filteredCourses = courses.filter(course => {
          const courseTag = course['item-tag'];
          // Check if course belongs to any of the selected filter categories
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
      
      // Reset to first page and render filtered results
      currentPage = 1;
      renderPage(currentPage);
      renderPagination();
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
