// event-details.js
// This script fetches event data based on the event title in the URL and populates the page.

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function fetchEventData(title) {
  const apiUrl = 'https://680cd8a62ea307e081d53532.mockapi.io/event';
  try {
    const response = await fetch(apiUrl);
    const events = await response.json();
    // Try to find by title (case-insensitive)
    return events.find(e => e['item-title'] && e['item-title'].toLowerCase() === title.toLowerCase());
  } catch (err) {
    return null;
  }
}

async function renderEventDetails() {
  const title = getQueryParam('title');
  if (!title) {
    document.getElementById('item-title').textContent = 'Event not found';
    document.getElementById('whole-event').textContent = 'No event title specified.';
    return;
  }
  const event = await fetchEventData(title);
  if (!event) {
    document.getElementById('item-title').textContent = 'Event not found';
    document.getElementById('whole-event').textContent = 'Could not load event details.';
    return;
  }
  document.getElementById('item-tag').textContent = event['item-tag'] || '';
  document.getElementById('item-date').textContent = event['item-date'] || '';
  document.getElementById('item-title').textContent = event['item-title'] || '';
  document.getElementById('whole-event').textContent = event['whole-event'] || '';
  // Optionally set author or image if available in event data
}

document.addEventListener('DOMContentLoaded', renderEventDetails);
