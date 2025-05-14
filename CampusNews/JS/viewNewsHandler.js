// Get news ID from URL parameters
function getNewsId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Format date to a more readable format
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Show loading state
function showLoading() {
  const newsContent = document.querySelector(".news-content");
  newsContent.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading article...</p>
        </div>
    `;
}

// Hide loading state
function hideLoading() {
  const newsContent = document.querySelector(".news-content");
  newsContent.classList.remove("loading");
}

// Fetch and display specific news article
async function fetchNewsDetail() {
  showLoading();
  try {
    const newsId = getNewsId();
    if (!newsId) {
      window.location.href = "campus-news.html";
      return;
    }

    // Fetch a single news item by ID from the backend
    const response = await fetch(
      `https://f6da7095-a6f6-4d17-92c3-5fe84333d397-00-i370d3pysjru.pike.replit.dev/news.php?id=${newsId}`
    );
    if (!response.ok) {
      window.location.href = "campus-news.html";
      return;
    }
    const newsItem = await response.json();

    if (!newsItem || !newsItem["news-title"]) {
      window.location.href = "campus-news.html";
      return;
    }

    // Update page title and meta description
    document.title = `${newsItem["news-title"]} - Campus Hub`;
    document.querySelector('meta[name="description"]').content =
      newsItem["news-short-desc"];

    // Update header content
    document.querySelector(".page-title").textContent = newsItem["news-title"];
    document.querySelector(".page-description").textContent = `${
      newsItem["news-tag"]
    } | ${formatDate(newsItem["news-date"])}`;

    // Update article tag and content
    document.querySelector(".badge").textContent = newsItem["news-tag"];

    // Update news content
    const newsContent = document.querySelector(".news-content");
    newsContent.innerHTML = "";
    const paragraphs = newsItem["whole-news"].split(". ");
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim()) {
        const p = document.createElement("p");
        p.textContent = paragraph.trim() + ".";
        newsContent.appendChild(p);
      }
    });

    // Update metadata
    const lastUpdated = document.querySelector(".text-muted small:last-child");
    lastUpdated.textContent = `Last updated: ${formatDate(
      newsItem["news-date"]
    )}`;
  } catch (error) {
    console.error("Error fetching news:", error);
    document.querySelector(".news-content").innerHTML =
      '<p class="text-danger"><i class="fas fa-exclamation-circle me-2"></i>Error loading news article. Please try again later.</p>';
  } finally {
    hideLoading();
  }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", fetchNewsDetail);
