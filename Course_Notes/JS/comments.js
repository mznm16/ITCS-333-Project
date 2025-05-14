// Handles posting and fetching comments for notes
// Uses add-comment.php and get-comments.php on the remote server

const apiBase = 'https://48b2a128-b883-4c2b-81e4-26a3d02113bd-00-89sz2gccdxxn.sisko.replit.dev/';

function escapeHtml(text) {
  return text.replace(/["&'<>]/g, c => ({'"':'&quot;','&':'&amp;','\'':'&#39;','<':'&lt;','>':'&gt;'}[c]));
}

function renderComments(comments) {
  const commentsContainer = document.getElementById('comments-container') || (() => {
    const div = document.createElement('div');
    div.id = 'comments-container';
    div.className = 'comments-section mt-4';
    const form = document.querySelector('form');
    if (form) form.parentNode.insertBefore(div, form.nextSibling);
    return div;
  })();
  const commentsList = (Array.isArray(comments) ? comments : (comments.comments || [])).map(c => `
    <div class="card mb-3 shadow-sm">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-primary">${escapeHtml(c.commenter || 'Guest')}</strong>
          <span class="text-muted small">${c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
        </div>
        <div class="ps-2">${escapeHtml(c.comment)}</div>
      </div>
    </div>
  `).join('');
  commentsContainer.innerHTML = commentsList || '<div class="text-muted">No comments yet.</div>';
}

async function fetchComments(noteId) {
  try {
    const res = await fetch(apiBase + 'get-comments.php?note_id=' + encodeURIComponent(noteId));
    const data = await res.json();
    if (data.error) {
      renderComments([]);
    } else {
      renderComments(data);
    }
  } catch (e) {
    renderComments([]);
  }
}

async function postComment(noteId, commenter, comment) {
  const formData = new FormData();
  formData.append('note_id', noteId);
  formData.append('commenter', commenter);
  formData.append('comment', comment);
  await fetch(apiBase + 'add-comment.php', {
    method: 'POST',
    body: formData
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const noteId = urlParams.get('id');
  fetchComments(noteId);
  const commentForm = document.querySelector('form');
  if (commentForm) {
    commentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const commentText = document.getElementById('commentText').value.trim();
      if (!commentText) return;
      await postComment(noteId, 'Guest', commentText);
      document.getElementById('commentText').value = '';
      fetchComments(noteId);
    });
  }
});
