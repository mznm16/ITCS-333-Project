// --- BEGIN: Modern logic for fetching and rendering note details and comments ---
const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('id');
const apiBase = 'https://48b2a128-b883-4c2b-81e4-26a3d02113bd-00-89sz2gccdxxn.sisko.replit.dev/';

function escapeHtml(text) {
  return text.replace(/["&'<>]/g, c => ({'"':'&quot;','&':'&amp;','\'':'&#39;','<':'&lt;','>':'&gt;'}[c]));
}

function renderNote(note) {
  // Defensive: Only update elements if they exist
  const pageTitle = document.querySelector('.page-title');
  if (pageTitle) pageTitle.textContent = note.title || '';
  const pageDescription = document.querySelector('.page-description');
  if (pageDescription) pageDescription.textContent = note.college || '';
  const badge = document.querySelector('.badge.bg-primary');
  if (badge) badge.textContent = note.college || '';
  const desc = document.querySelector('h3.h5.mb-3 + p');
  if (desc) desc.textContent = note.long_description || note.description || '';
  const fileIcon = document.querySelector('.file-icon i');
  const fileName = document.querySelector('.file-icon + div p');
  if (note.file_url) {
    const fileUrl = note.file_url.toLowerCase();
    let iconClass = 'fas ';
    
    // Set appropriate icon based on file type
    if (fileUrl.endsWith('.pdf')) {
      iconClass += 'fa-file-pdf text-danger';
    } else if (fileUrl.endsWith('.docx')) {
      iconClass += 'fa-file-word text-primary';
    } else if (fileUrl.endsWith('.ppt') || fileUrl.endsWith('.pptx')) {
      iconClass += 'fa-file-powerpoint text-warning';
    } else if (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg') || fileUrl.endsWith('.png')) {
      iconClass += 'fa-file-image text-success';
    } else {
      iconClass += 'fa-file text-secondary';
    }
    
    // Add fa-5x class for larger icons
    iconClass += ' fa-5x';
    
    if (fileIcon) fileIcon.className = iconClass;
    if (fileName) fileName.textContent = note.file_url.split('/').pop();
  } else {
    if (fileIcon) fileIcon.className = 'fas fa-file text-secondary fa-5x';
    if (fileName) fileName.textContent = 'No file';
  }
  
  const downloadBtn = document.querySelector('.btn.btn-primary');
  if (downloadBtn) {
    if (note.file_url) {
      // Use remote download.php for secure file download
      const fileName = note.file_url.split('/').pop();
      downloadBtn.href = apiBase + 'download.php?file=' + encodeURIComponent(fileName);
      downloadBtn.style.display = '';
    } else {
      downloadBtn.style.display = 'none';
    }
  }
  const uploader = document.querySelector('.item-uploader');
  if (uploader) uploader.textContent = note.uploader ? 'Uploaded by: ' + note.uploader : '';
  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) lastUpdated.textContent = 'Last updated: ' + (note.created_at ? new Date(note.created_at).toLocaleDateString() : '');
}

async function fetchNoteAndComments() {
  try {
    // Fetch note details
    const noteRes = await fetch(apiBase + 'get-note.php?id=' + noteId);
    if (!noteRes.ok) throw new Error('Failed to fetch note');
    const note = await noteRes.json();
    renderNote(note);

    // Debug the note ID
    console.log('Fetching comments for note ID:', noteId);

    // Fetch comments for this note
    const commentsRes = await fetch(apiBase + 'get-comments.php?note_id=' + noteId);
    if (!commentsRes.ok) throw new Error('Failed to fetch comments');
    const comments = await commentsRes.json();
    
    // Debug the comments response
    console.log('Comments response:', comments);

    // Check if we got an error response
    if (comments.error) {
      console.error('Error from server:', comments.error);
      renderComments([]);
      return;
    }

    // Ensure comments is an array
    const commentArray = Array.isArray(comments) ? comments : [];
    renderComments(commentArray);
  } catch (error) {
    console.error('Error fetching note or comments:', error);
    renderComments([]);
  }
}

function renderComments(comments) {
  const commentCount = comments.length;
  // Update the comments counter in the UI
  const commentCounter = document.getElementById('comments-count');
  if (commentCounter) {
    commentCounter.textContent = commentCount;
  }
  console.log('Rendering', commentCount, 'comments');

  // Find the existing comments container that should be after the comment form
  let commentsContainer = document.getElementById('comments-container');
  if (!commentsContainer) {
    commentsContainer = document.createElement('div');
    commentsContainer.id = 'comments-container';
    commentsContainer.className = 'comments-section mt-4';
    // Insert after the existing comment form
    const form = document.querySelector('form');
    if (form) {
      form.parentNode.insertBefore(commentsContainer, form.nextSibling);
    }
  }

  // Render comments list
  const commentsList = comments.map(c => `
    <div class="card mb-3 shadow-sm">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-primary">Guest</strong>
          <span class="text-muted small">${new Date(c.created_at).toLocaleString()}</span>
        </div>
        <div class="ps-2">${escapeHtml(c.comment)}</div>
      </div>
    </div>
  `).join('');

  commentsContainer.innerHTML = commentsList || '<div class="text-muted">No comments yet.</div>';
}

function renderEditableFields(note) {
  // Remove any existing edit form
  let existingForm = document.getElementById('edit-note-form');
  if (existingForm) existingForm.remove();

  // Create form
  const form = document.createElement('form');
  form.id = 'edit-note-form';
  form.className = 'mt-4';
  form.innerHTML = `
    <div class="mb-3">
      <label for="editTitle" class="form-label">Title</label>
      <input type="text" class="form-control" id="editTitle" value="${note.title ? escapeHtml(note.title) : ''}" required>
    </div>
    <div class="mb-3">
      <label for="editCollege" class="form-label">College</label>
      <input type="text" class="form-control" id="editCollege" value="${note.college ? escapeHtml(note.college) : ''}" disabled>
    </div>
    <div class="mb-3">
      <label for="editDescription" class="form-label">Short Description</label>
      <textarea class="form-control" id="editDescription" rows="2" required>${note.description ? escapeHtml(note.description) : ''}</textarea>
    </div>
    <div class="mb-3">
      <label for="editLongDescription" class="form-label">Long Description</label>
      <textarea class="form-control" id="editLongDescription" rows="4">${note.long_description ? escapeHtml(note.long_description) : ''}</textarea>
    </div>
    <button type="submit" class="btn btn-success">Save Changes</button>
    <button type="button" class="btn btn-secondary ms-2" id="cancelEditBtn">Cancel</button>
  `;

  // Insert form after the note card
  const card = document.querySelector('.card.shadow-sm.mb-4');
  if (card) card.parentNode.insertBefore(form, card.nextSibling);

  // Cancel button handler
  form.querySelector('#cancelEditBtn').onclick = function() {
    form.remove();
  };

  // Submit handler
  form.onsubmit = async function(e) {
    e.preventDefault();
    const newTitle = document.getElementById('editTitle').value.trim();
    const newDesc = document.getElementById('editDescription').value.trim();
    const newLongDesc = document.getElementById('editLongDescription').value.trim();
    if (!newTitle || !newDesc) return;
    try {
      const res = await fetch(apiBase + 'upload-notes.php?edit=1', {
        method: 'POST',
        body: (() => {
          const fd = new FormData();
          fd.append('id', noteId);
          fd.append('title', newTitle);
          fd.append('college', note.college || '');
          fd.append('description', newDesc);
          fd.append('long_description', newLongDesc);
          fd.append('uploader', note.uploader || '');
          return fd;
        })()
      });
      const result = await res.json();
      if (result.success) {
        if (typeof showSuccessPopout === 'function') {
          showSuccessPopout('Note updated successfully!');
        }
        form.remove();
        // Use the updated note from the response if available
        if (result.note) {
          renderNote(result.note);
        } else {
          // fallback: refetch
          const noteRes = await fetch(apiBase + 'get-note.php?id=' + noteId);
          const updatedNote = await noteRes.json();
          renderNote(updatedNote);
        }
      } else {
        alert(result.error || 'Failed to update note.');
      }
    } catch (err) {
      alert('An error occurred while updating.');
    }
  };
  // Add margin below the form
  form.style.marginBottom = '2rem';
}

document.addEventListener('DOMContentLoaded', function() {
  fetchNoteAndComments();

  // --- DELETE BUTTON FUNCTIONALITY ---
  const deleteBtn = document.querySelector('.btn-outline-danger');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      if (!noteId) return;
      if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) return;
      // Show loading spinner overlay
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
      document.body.appendChild(loadingOverlay);
      try {
        const res = await fetch(apiBase + 'delete-note.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `id=${encodeURIComponent(noteId)}`
        });
        const result = await res.json();
        if (result.success) {
          if (typeof showSuccessPopout === 'function') {
            showSuccessPopout('Note deleted successfully!');
          } else {
            const alert = document.createElement('div');
            alert.className = 'alert alert-success mt-3';
            alert.role = 'alert';
            alert.textContent = 'Note deleted successfully! Redirecting...';
            document.body.appendChild(alert);
            setTimeout(() => { alert.remove(); }, 1500);
          }
          setTimeout(() => {
            window.location.href = 'course-notes.html';
          }, 1800);
        } else {
          alert(result.error || 'Failed to delete note.');
        }
      } catch (err) {
        alert('An error occurred while deleting.');
      } finally {
        // Remove loading overlay after redirect or error
        setTimeout(() => {
          if (document.body.contains(loadingOverlay)) loadingOverlay.remove();
        }, 2000);
      }
    });
  }

  // --- EDIT BUTTON FUNCTIONALITY ---
  const editBtn = document.querySelector('.btn-outline-secondary');
  if (editBtn) {
    editBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      // Fetch current note data and show editable fields
      try {
        const res = await fetch(apiBase + 'get-note.php?id=' + noteId);
        const note = await res.json();
        renderEditableFields(note);
      } catch (err) {
        alert('Failed to load note for editing.');
      }
    });
  }

  // ...existing comment form logic...
  const commentForm = document.querySelector('form');
  if (commentForm) {
    commentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const commentText = document.getElementById('commentText').value.trim();
      if (!commentText) return;
      await fetch(apiBase + 'add-comment.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `note_id=${encodeURIComponent(noteId)}&commenter=Guest&comment=${encodeURIComponent(commentText)}`
      });
      document.getElementById('commentText').value = '';
      fetchNoteAndComments();
    });
  }
});
// --- END: Modern logic ---