document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('uploadNotesForm');
    const fileInput = document.getElementById('notesFile');
    
    // Supported file types and max size (10MB)
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    // Create error elements for each field
    function createErrorElement(inputId) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.id = `${inputId}Error`;
        return errorDiv;
    }

    // Add error elements after each required input
    document.querySelectorAll('input[required], textarea[required]').forEach(input => {
        const errorDiv = createErrorElement(input.id);
        input.parentNode.appendChild(errorDiv);
    });

    // Validate individual field
    function validateField(field) {
        const errorDiv = document.getElementById(`${field.id}Error`);
        field.classList.remove('is-invalid', 'is-valid');
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('is-invalid');
            errorDiv.textContent = 'This field is required';
            errorDiv.style.display = 'block';
            return false;
        }

        // Course code validation
        if (field.id === 'courseCode') {
            const codeRegex = /^[A-Z]{2,4}\d{3}$/;
            if (!codeRegex.test(field.value.trim())) {
                field.classList.add('is-invalid');
                errorDiv.textContent = 'Invalid course code format (e.g., CS101)';
                errorDiv.style.display = 'block';
                return false;
            }
        }

        // Professor name validation
        if (field.id === 'professor' && field.value.trim()) {
            const nameRegex = /^[A-Za-z\s.'"-]{2,50}$/;
            if (!nameRegex.test(field.value.trim())) {
                field.classList.add('is-invalid');
                errorDiv.textContent = 'Invalid professor name format (2-50 characters, letters, spaces, and basic punctuation only)';
                errorDiv.style.display = 'block';
                return false;
            }
        }

        // Tags validation
        if (field.id === 'tags' && field.value.trim()) {
            const tags = field.value.split(',').map(tag => tag.trim());
            const tagRegex = /^[A-Za-z0-9\s-]{2,20}$/;
            
            // Check each tag format
            const invalidTags = tags.filter(tag => !tagRegex.test(tag));
            if (invalidTags.length > 0) {
                field.classList.add('is-invalid');
                errorDiv.textContent = 'Tags should be 2-20 characters long, containing letters, numbers, spaces, or hyphens';
                errorDiv.style.display = 'block';
                return false;
            }
            
            // Check number of tags
            if (tags.length > 5) {
                field.classList.add('is-invalid');
                errorDiv.textContent = 'Maximum 5 tags allowed';
                errorDiv.style.display = 'block';
                return false;
            }
        }

        // File validation
        if (field.id === 'notesFile' && field.files.length > 0) {
            const file = field.files[0];
            
            // Check file type
            if (!allowedTypes.includes(file.type)) {
                field.classList.add('is-invalid');
                errorDiv.textContent = 'Invalid file type. Please upload PDF, DOCX, PPT, JPG, or PNG files';
                errorDiv.style.display = 'block';
                return false;
            }
            
            // Check file size
            if (file.size > maxSize) {
                field.classList.add('is-invalid');
                errorDiv.textContent = 'File size exceeds 10MB limit';
                errorDiv.style.display = 'block';
                return false;
            }
        }

        field.classList.add('is-valid');
        errorDiv.style.display = 'none';
        return true;
    }

    // Real-time validation on input
    form.querySelectorAll('input[required], textarea[required]').forEach(field => {
        field.addEventListener('input', () => validateField(field));
        field.addEventListener('blur', () => validateField(field));
    });

    // Add validation for non-required fields
    const professorInput = document.getElementById('professor');
    const tagsInput = document.getElementById('tags');

    // Add error elements for non-required fields
    [professorInput, tagsInput].forEach(input => {
        if (!document.getElementById(`${input.id}Error`)) {
            const errorDiv = createErrorElement(input.id);
            input.parentNode.appendChild(errorDiv);
        }
    });

    // Add real-time validation for non-required fields
    [professorInput, tagsInput].forEach(field => {
        field.addEventListener('input', () => validateField(field));
        field.addEventListener('blur', () => validateField(field));
    });

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        validateField(fileInput);
    });

    // If in edit mode, fetch note data and prefill form
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get('edit') === '1';
    const noteId = urlParams.get('id');
    const apiBase = 'https://48b2a128-b883-4c2b-81e4-26a3d02113bd-00-89sz2gccdxxn.sisko.replit.dev/';

    if (isEdit && noteId) {
        // Change form title/button for edit mode
        const formTitle = document.querySelector('.card-header h2, .card-header .h4');
        if (formTitle) formTitle.textContent = 'Edit Course Notes';
        const submitBtn = document.querySelector('#uploadNotesForm button[type="submit"]');
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Note';

        // Fetch note data and prefill form
        try {
            const res = await fetch(apiBase + 'get-note.php?id=' + encodeURIComponent(noteId));
            const note = await res.json();
            if (note && note.id) {
                document.getElementById('title').value = note.title || '';
                document.getElementById('subject').value = note.subject || '';
                document.getElementById('description').value = note.description || '';
                document.getElementById('long_description').value = note.long_description || '';
                document.getElementById('uploader').value = note.uploader || '';
                // File input cannot be prefilled for security reasons
            }
        } catch (err) {
            // Optionally show error
        }
    }    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Remove previous alerts
        const prevAlert = document.querySelector('.alert-success');
        if (prevAlert) prevAlert.remove();

        // Remove any previous loading overlays
        document.querySelectorAll('.loading-overlay').forEach(el => el.remove());
        
        // Create a single, centered loading spinner overlay (identical to delete note)
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loadingOverlay);
        document.head.appendChild(spinnerStyle);

        // Validate required fields
        let valid = true;
        form.querySelectorAll('input[required], textarea[required]').forEach(field => {
            if (!validateField(field)) valid = false;
        });
        if (!valid) {
            if (loadingOverlay) loadingOverlay.remove();
            return;
        }

        // Prepare form data
        const formData = new FormData(form);
        // Add file
        if (fileInput.files.length > 0) {
            formData.append('notesFile', fileInput.files[0]);
        }

        // --- EDIT MODE: update note instead of upload ---
        if (isEdit && noteId) {
            formData.append('id', noteId);
            try {
                const response = await fetch(apiBase + 'upload-notes.php?edit=1', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    const alert = document.createElement('div');
                    alert.className = 'alert alert-success mt-3';
                    alert.role = 'alert';
                    alert.textContent = 'Note updated successfully! Redirecting...';
                    form.parentNode.insertBefore(alert, form.nextSibling);
                    setTimeout(() => {
                        window.location.href = 'course-notes.html';
                        if (loadingOverlay) loadingOverlay.remove();
                    }, 1800);
                } else {
                    alert('Update failed: ' + (result.error || 'Unknown error'));
                    if (loadingOverlay) loadingOverlay.remove();
                }
            } catch (err) {
                alert('Update failed: ' + err.message);
                if (loadingOverlay) loadingOverlay.remove();
            }
            return;
        }
        // --- END EDIT MODE ---

        // AJAX upload (add mode)
        try {
            const response = await fetch('https://48b2a128-b883-4c2b-81e4-26a3d02113bd-00-89sz2gccdxxn.sisko.replit.dev/upload-notes.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                // Show green Bootstrap alert
                const alert = document.createElement('div');
                alert.className = 'alert alert-success mt-3';
                alert.role = 'alert';
                alert.textContent = 'Notes uploaded successfully! Redirecting...';
                form.parentNode.insertBefore(alert, form.nextSibling);
                setTimeout(() => {
                    window.location.href = 'course-notes.html';
                    if (loadingOverlay) loadingOverlay.remove();
                }, 1800);
            } else {
                alert('Upload failed: ' + (result.error || 'Unknown error'));
                if (loadingOverlay) loadingOverlay.remove();
            }
        } catch (err) {
            alert('Upload failed: ' + err.message);
            if (loadingOverlay) loadingOverlay.remove();
        }
    });

    // Remove custom spinner CSS if present
    const oldStyle = document.querySelector('style[data-upload-spinner]:not([data-upload-spinner="true"])');
    if (oldStyle) oldStyle.remove();
});