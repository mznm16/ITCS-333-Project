// Show loading state
const itemList = document.getElementById('item-list');
itemList.innerHTML = '<div class="loading-spinner"></div>';

// Fetch the course notes from the PHP backend
fetch('https://48b2a128-b883-4c2b-81e4-26a3d02113bd-00-89sz2gccdxxn.sisko.replit.dev/fetch-notes.php')
  .then(response => response.json())
  .then(notes => {
    const pagination = document.querySelector('.pagination');
    let currentPage = 1;
    const itemsPerPage = 6;
    let filteredNotes = [...notes];
    let isLoading = false;
    let currentSearchTerm = '';

    // Function to apply filters to notes
    function applyFilters(notesToFilter, selectedFilters) {
      if (selectedFilters.length === 0) return notesToFilter;
      return notesToFilter.filter(note => selectedFilters.includes(note.college));
    }

    // Function to apply search to notes
    function applySearch(notesToSearch, searchTerm) {
      if (!searchTerm) return notesToSearch;
      searchTerm = searchTerm.toLowerCase();
      return notesToSearch.filter(note => {
        const title = (note.title || '').toLowerCase();
        const subject = (note.subject || '').toLowerCase();
        const desc = (note.description || '').toLowerCase();
        return title.includes(searchTerm) || subject.includes(searchTerm) || desc.includes(searchTerm);
      });
    }

    // Function to render notes
    function renderNotes(notesToRender) {
      if (!notesToRender.length) {
        itemList.innerHTML = '<div class="no-results">No notes found.</div>';
        return;
      }
      itemList.innerHTML = notesToRender.map(note => `
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="card-title mb-0">${note.title}</h5>
              <span class="badge bg-primary">${note.college || ''}</span>
            </div>
            <p class="card-text">${note.description || ''}</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <a href="view-notes.html?id=${note.id}" class="btn btn-outline-primary btn-sm mb-2"><i class="fas fa-eye"></i> View Note</a>
              <small class="text-muted">${note.uploader ? 'By ' + note.uploader : ''}</small>
              <small class="text-muted">${note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}</small>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Function to update results based on both search and filters
    function updateResults() {
      const selectedFilters = Array.from(document.querySelectorAll('.filter-menu input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
      
      // First apply filters to all notes
      let results = applyFilters(notes, selectedFilters);
      // Then apply search to filtered results
      results = applySearch(results, currentSearchTerm);
      
      filteredNotes = results;
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

    function renderPage(page, notesToRender = filteredNotes) {
      itemList.innerHTML = '';
      const startIdx = (page - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const pageNotes = notesToRender.slice(startIdx, endIdx);
      
      renderNotes(pageNotes);
    }

    function renderPagination(notesToPaginate = filteredNotes) {
      const totalPages = Math.ceil(notesToPaginate.length / itemsPerPage);
      pagination.innerHTML = '';
      if (totalPages <= 1) return;

      // Previous arrow
      const prevBtn = document.createElement('button');
      prevBtn.className = 'page-btn';
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      prevBtn.disabled = currentPage === 1;
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderPage(currentPage, notesToPaginate);
          renderPagination(notesToPaginate);
        }
      });
      pagination.appendChild(prevBtn);

      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => {
          currentPage = i;
          renderPage(currentPage, notesToPaginate);
          renderPagination(notesToPaginate);
        });
        pagination.appendChild(btn);
      }

      // Next arrow
      const nextBtn = document.createElement('button');
      nextBtn.className = 'page-btn';
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderPage(currentPage, notesToPaginate);
          renderPagination(notesToPaginate);
        }
      });
      pagination.appendChild(nextBtn);
    }

    // Initial render and sort
    // Set 'Most Recent' as default sort
    const recentSortRadio = document.querySelector('.sort-menu input[value="recent"]');
    if (recentSortRadio) {
        recentSortRadio.checked = true;
        // Sort by most recent
        filteredNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
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
            filteredNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
          case 'alphabetical':
            filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'college':
            filteredNotes.sort((a, b) => (a.college || '').localeCompare(b.college || ''));
            break;
        }
        
        // Re-render with sorted filtered notes
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
  .catch(() => {
    itemList.innerHTML = '<div class="error">Failed to load notes.</div>';
  });
