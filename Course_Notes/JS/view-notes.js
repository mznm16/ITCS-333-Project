document.addEventListener('DOMContentLoaded', function() {
    // Get the course ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    console.log('Course ID from URL:', courseId);

    if (!courseId) {
        window.location.href = 'course-notes.html';
        return;
    }

    // Store the original main content
    const mainElement = document.querySelector('main');
    const originalContent = mainElement.innerHTML;

    // Show loading state
    mainElement.innerHTML = '<div class="loading-spinner"></div>';

    console.log('Fetching courses from API...');
    
    // Fetch all courses and find the specific one
    fetch('https://680baf23d5075a76d98c0d14.mockapi.io/courses')
        .then(response => {
            console.log('API Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(courses => {
            console.log('Courses data received:', courses);
            console.log('Looking for course with ID:', courseId);
            
            // Find the specific course by ID
            const course = courses.find(c => c.id.toString() === courseId.toString());
            
            console.log('Found course:', course);
            
            if (!course) {
                throw new Error('Course not found');
            }

            // Restore original content structure
            mainElement.innerHTML = originalContent;

            try {
                // Update page title and description
                document.querySelector('.page-title').textContent = course['item-title'];
                document.querySelector('.page-description').textContent = `${course['item-tag']} | Updated: ${course['item-date']}`;
                
                // Update subject badge
                document.querySelector('.badge.bg-primary').textContent = course['item-tag'];
                
                // Update description
                document.querySelector('.card-body p').textContent = course['long-desc'];
                
                // Update file name
                document.querySelector('.d-flex.align-items-center p.mb-0').textContent = 
                    `${course['file-name']} (8 pages, 1.5 MB)`;
                
                // Update last updated date
                document.querySelector('#lastUpdated').textContent = `Last updated: ${course['item-date']}`;

                console.log('Page updated successfully');
            } catch (e) {
                console.error('Error updating page elements:', e);
                throw e;
            }
        })
        .catch(error => {
            console.error('Error details:', error);
            mainElement.innerHTML = `
                <div class="container my-5">
                    <div class="row">
                        <div class="col-lg-8 mx-auto">
                            <div class="alert alert-danger" role="alert">
                                <h4 class="alert-heading">Error loading course details</h4>
                                <p>We couldn't load the course information. Please try again later.</p>
                                <hr>
                                <p class="mb-0">
                                    <a href="course-notes.html" class="alert-link">
                                        <i class="fas fa-arrow-left me-2"></i>Back to Course List
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
});