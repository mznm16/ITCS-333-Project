
// Check authentication state
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const authBtn = document.getElementById('authBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (user && user.username) {
    // User is logged in
    authBtn.textContent = user.username;
    authBtn.href = '#';
    logoutBtn.style.display = 'inline-block';
  } else {
    // User is logged out
    authBtn.textContent = 'Sign In';
    authBtn.href = '../../Home_Page/HTML_Pages/signin.html';
    logoutBtn.style.display = 'none';
  }
}

// Handle logout
function logout() {
  localStorage.removeItem('user');
  window.location.href = "../../index.html";
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
