// Form validation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.textContent = 'Event created successfully!';
    form.insertBefore(successMessage, form.firstChild);

    // Add error message elements
    document.querySelectorAll('.form-group').forEach(group => {
        const input = group.querySelector('.form-input');
        if (input) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.id = `${input.id}-error`;
            group.appendChild(errorDiv);
        }
    });

    // Validation rules
    const validations = {
        'event-title': {
            required: true,
            minLength: 5,
            message: 'Title must be at least 5 characters long'
        },
        'event-date': {
            required: true,
            future: true,
            message: 'Please select a future date'
        },
        'event-time': {
            required: true,
            message: 'Please select a time'
        },
        'event-category': {
            required: true,
            message: 'Please select a category'
        },
        'event-location': {
            required: true,
            message: 'Location is required'
        },
        'event-description': {
            required: true,
            minLength: 20,
            message: 'Description must be at least 20 characters long'
        },
        'organizer-name': {
            required: true,
            message: 'Organizer name is required'
        },
        'organizer-email': {
            required: true,
            email: true,
            message: 'Please enter a valid email address'
        }
    };

    // Validate single field
    function validateField(input) {
        const rules = validations[input.id];
        const errorDiv = document.getElementById(`${input.id}-error`);
        let isValid = true;
        let errorMessage = '';

        if (!rules) return true;

        const value = input.value.trim();

        if (rules.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        } else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        } else if (rules.future && new Date(value) <= new Date()) {
            isValid = false;
            errorMessage = rules.message;
        }

        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = isValid ? 'none' : 'block';
        }
        
        input.classList.toggle('error', !isValid);
        return isValid;
    }

    // Real-time validation
    form.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        // Validate all fields
        form.querySelectorAll('.form-input').forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            // Scroll to first error
            const firstError = form.querySelector('.form-input.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            successMessage.style.display = 'block';
            form.reset();
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);

            // Optional: Redirect to events page
            // window.location.href = 'events.html';
        } catch (error) {
            console.error('Error creating event:', error);
            alert('There was an error creating the event. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});