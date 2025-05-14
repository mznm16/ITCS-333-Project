// Handles uploading notes from the upload-notes.html form
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('uploadNotesForm');
    const fileInput = document.getElementById('notesFile');
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // Basic validation
        const title = form.querySelector('#title').value.trim();
        const college = form.querySelector('#college').value.trim();
        const description = form.querySelector('#description').value.trim();
        
        if (!title || !college || !description) {
            showErrorPopout('Please fill in all required fields');
            return;
        }

        if (!fileInput.files || fileInput.files.length === 0) {
            showErrorPopout('Please select a file to upload');
            return;
        }

        // Show loading overlay
        document.body.appendChild(loadingOverlay);
        
        const formData = new FormData(form);
        
        try {
            console.log('Sending request...');
            const response = await fetch('https://48b2a128-b883-4c2b-81e4-26a3d02113bd-00-89sz2gccdxxn.sisko.replit.dev/upload-notes.php', {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status);
            const text = await response.text();
            console.log('Response text:', text);
            
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid JSON response from server: ' + text);
            }
            
            if (result.success) {
                showSuccessPopout('File uploaded successfully!');
                setTimeout(() => {
                    window.location.href = 'course-notes.html';
                }, 1800);
            } else {
                showErrorPopout(result.error || 'Upload failed. Please try again.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showErrorPopout(err.message || 'An error occurred while uploading. Please try again.');
        } finally {
            loadingOverlay.remove();
        }
    });
});

function showSuccessPopout(message) {
    showPopout(message, '#198754');
}

function showErrorPopout(message) {
    showPopout(message, '#dc3545');
}

function showPopout(message, color) {
    let popout = document.createElement('div');
    popout.textContent = message;
    popout.style.position = 'fixed';
    popout.style.top = '30px';
    popout.style.right = '30px';
    popout.style.background = color;
    popout.style.color = 'white';
    popout.style.padding = '16px 32px';
    popout.style.borderRadius = '8px';
    popout.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    popout.style.zIndex = 9999;
    popout.style.fontSize = '1.1rem';
    document.body.appendChild(popout);
    setTimeout(() => {
        popout.remove();
    }, 3000);
}
