document.addEventListener('DOMContentLoaded', function() {
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

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // Validate all required fields
        form.querySelectorAll('input[required], textarea[required]').forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success mt-3';
            successAlert.role = 'alert';
            successAlert.textContent = 'Notes uploaded successfully!';
            form.insertBefore(successAlert, form.firstChild);

            // Hide success message after 3 seconds
            setTimeout(() => {
                successAlert.remove();
                form.reset();
                form.querySelectorAll('.is-valid').forEach(field => {
                    field.classList.remove('is-valid');
                });
            }, 3000);
        }
    });
});