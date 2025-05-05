document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    // Form validation and submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch('https://PHP-MySQL.XMo2.repl.co/upload_notes.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showMessage('success', 'Course notes uploaded successfully!');
                // Redirect to notes listing page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'course-notes.html';
                }, 2000);
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showMessage('error', 'Failed to upload notes. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Upload Notes';
        }
    });
    
    // Field validation
    const requiredFields = [
        { id: 'course_code', minLength: 5 },
        { id: 'course_title', minLength: 5 },
        { id: 'course_category', required: true },
        { id: 'description', minLength: 20 },
        { id: 'file', required: true }
    ];
    
    function validateField(field) {
        const input = document.getElementById(field.id);
        const value = input.value.trim();
        
        if (!value && field.required) {
            showFieldError(input, 'This field is required');
            return false;
        }
        
        if (field.minLength && value.length < field.minLength) {
            showFieldError(input, `Must be at least ${field.minLength} characters`);
            return false;
        }
        
        if (field.id === 'file') {
            const file = input.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    showFieldError(input, 'File size must be less than 10MB');
                    return false;
                }
                
                const allowedTypes = ['application/pdf', 'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'image/jpeg', 'image/png'];
                if (!allowedTypes.includes(file.type)) {
                    showFieldError(input, 'Only PDF, Word, PowerPoint, JPG and PNG files are allowed');
                    return false;
                }
            }
        }
        
        clearFieldError(input);
        return true;
    }
    
    function showFieldError(input, message) {
        const errorDiv = input.nextElementSibling || document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        if (!input.nextElementSibling) {
            input.parentNode.appendChild(errorDiv);
        }
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    }
    
    function clearFieldError(input) {
        const errorDiv = input.nextElementSibling;
        if (errorDiv && errorDiv.className.includes('invalid-feedback')) {
            errorDiv.remove();
        }
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }
    
    function showMessage(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, form.parentElement);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    
    // Add validation listeners to all fields
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            input.addEventListener('blur', () => validateField(field));
            input.addEventListener('input', () => validateField(field));
        }
    });
});