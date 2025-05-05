document.addEventListener('DOMContentLoaded', async function() {
    const noteId = new URLSearchParams(window.location.search).get('id');
    
    if (!noteId) {
        window.location.href = 'course-notes.html';
        return;
    }
    
    // Show loading state
    const contentArea = document.querySelector('.note-content');
    contentArea.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading course notes...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`https://PHP-MySQL.XMo2.repl.co/getNotes.php?id=${noteId}`);
        const result = await response.json();
        
        if (!result.success || !result.data) {
            throw new Error('Note not found');
        }
        
        const note = result.data;
        
        // Update page title
        document.title = `${note.course_title} - Course Notes`;
        
        // Update metadata
        document.querySelector('.course-code').textContent = note.course_code;
        document.querySelector('.course-title').textContent = note.course_title;
        document.querySelector('.course-category').textContent = note['item-tag'];
        document.querySelector('.upload-date').textContent = `Uploaded: ${note['item-date']}`;
        
        // Update description
        document.querySelector('.course-description').textContent = note['item-desc'];
        
        // Create download link
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn && note.file_path) {
            downloadBtn.href = note.file_path;
            downloadBtn.download = note.file_path.split('/').pop();
        }
        
        // Hide loading spinner
        contentArea.innerHTML = ''; // Clear loading spinner
        
        // Show success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            Course notes loaded successfully!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        contentArea.parentElement.insertBefore(alert, contentArea);
        
        // Auto dismiss alert after 3 seconds
        setTimeout(() => {
            alert.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Error loading note:', error);
        contentArea.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load course notes. Please try again later.
            </div>
        `;
    }
});