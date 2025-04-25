// Fetch the course data from the API
fetch('https://680baf23d5075a76d98c0d14.mockapi.io/courses')
  .then(response => response.json())
  .then(courses => {
    const itemList = document.getElementById('item-list');

    // Loop through the courses and create course boxes dynamically
    courses.forEach(course => {
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
          <a href="view-notes.html" class="module-link">View Notes <i class="fas fa-arrow-right"></i></a>
        </div>
      `;

      itemList.appendChild(courseCard);
    });
  })
  .catch(error => {
    console.error('Error fetching course data:', error);
  });
