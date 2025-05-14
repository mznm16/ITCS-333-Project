// Handles uploading notes from the upload-notes.html form
// Shows a green popout on success and redirects to course-notes.html

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('uploadNotesForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        try {
            const response = await fetch('https://48b2a128-b883-4c2b-81e4-26a3d02113bd-00-89sz2gccdxxn.sisko.replit.dev/upload-notes.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                showSuccessPopout('File uploaded successfully!');
                setTimeout(() => {
                    window.location.href = 'course-notes.html';
                }, 1800);
            } else {
                showErrorPopout(result.message || 'Upload failed.');
            }
        } catch (err) {
            showErrorPopout('An error occurred while uploading.');
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
    }, 1500);
}
