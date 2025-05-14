const API_URL = 'https://cdf959f7-3f65-4593-bb62-14a1fbc10c5f-00-3ecxqa96ajnyg.pike.replit.dev/ITCS-333-Project/StudyGroup/php/api/groups';

// Get the current user ID from local storage (set during login)
function getCurrentUserId() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.user_id || 0;
}

// Categories of courses
const courseMapping = {
    'it': [
        { value: 'itcs333', text: 'ITCS 333 - Internet Web Development' },
        { value: 'itcs314', text: 'ITCS 314 - Network Security' },
        { value: 'itcs316', text: 'ITCS 316 - Human Computer Interaction' },
        { value: 'itcs214', text: 'ITCS 214 - Data Structures' },
        { value: 'itcs321', text: 'ITCS 321 - Assembly Language' }
    ],
    'engineering': [
        { value: 'eng101', text: 'ENG 101 - Engineering Mathematics' },
        { value: 'eng102', text: 'ENG 102 - Engineering Physics' },
        { value: 'eng103', text: 'ENG 103 - Engineering Drawing' },
        { value: 'eng104', text: 'ENG 104 - Engineering Mechanics' }
    ],
    'science': [
        { value: 'phys101', text: 'PHYS 101 - General Physics' },
        { value: 'chem101', text: 'CHEM 101 - General Chemistry' },
        { value: 'math101', text: 'MATH 101 - Calculus I' },
        { value: 'bio101', text: 'BIO 101 - General Biology' }
    ],
    'health': [
        { value: 'hss101', text: 'HSS 101 - Human Anatomy' },
        { value: 'hss102', text: 'HSS 102 - Sports Science' },
        { value: 'hss103', text: 'HSS 103 - Health Education' }
    ],
    'business': [
        { value: 'bus101', text: 'BUS 101 - Introduction to Business' },
        { value: 'bus102', text: 'BUS 102 - Accounting Principles' },
        { value: 'bus103', text: 'BUS 103 - Business Statistics' },
        { value: 'bus104', text: 'BUS 104 - Marketing Principles' }
    ],
    'law': [
        { value: 'law101', text: 'LAW 101 - Introduction to Law' },
        { value: 'law102', text: 'LAW 102 - Constitutional Law' },
        { value: 'law103', text: 'LAW 103 - Criminal Law' }
    ],
    'arts': [
        { value: 'art101', text: 'ART 101 - Art History' },
        { value: 'art102', text: 'ART 102 - Drawing Fundamentals' },
        { value: 'art103', text: 'ART 103 - Design Principles' }
    ]
};

// Add SweetAlert2 via CDN if not already present
(function() {
    if (!window.Swal) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        script.async = true;
        document.head.appendChild(script);
    }
})();

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

let studyGroups = [];
let currentPage = 1;
let currentSort = 'name'; // Default sort

function formatMeetingDays(days) {
    if (!Array.isArray(days) || days.length === 0) return 'No specific days';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
}

function formatMeetingTime(timestamp) {
    if (!timestamp) return 'Time not specified';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatLocation(location) {
    if (!location) return 'Location not specified';
    return location.toUpperCase();
}

function formatRequirements(requirements) {
    try {
        if (!requirements) return 'No requirements specified';

        const reqArray = Array.isArray(requirements) ? requirements : 
                        (typeof requirements === 'string' ? JSON.parse(requirements) : []);

        if (reqArray.length === 0) {
            return `<div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No specific requirements
            </div>`;
        }

        return `<ul class="list-unstyled mb-0">
            ${reqArray.map(req => {
                let icon = '';
                switch(req) {
                    case 'laptop':
                        icon = 'fas fa-laptop';
                        break;
                    case 'notes':
                        icon = 'fas fa-book';
                        break;
                    case 'headphones':
                        icon = 'fas fa-headphones';
                        break;
                    default:
                        icon = 'fas fa-check';
                }
                return `
                    <li class="mb-2">
                        <i class="${icon} text-success me-2"></i>
                        ${req.charAt(0).toUpperCase() + req.slice(1)}
                    </li>
                `;
            }).join('')}
        </ul>`;
    } catch (e) {
        console.error('Error formatting requirements:', e);
        return 'Error displaying requirements';
    }
}

// Helper function to handle arrays that might be strings
function ensureArray(possibleArray) {
    if (typeof possibleArray === 'string') {
        try {
            return JSON.parse(possibleArray);
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(possibleArray) ? possibleArray : [];
}

// Update group details
async function loadGroupDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');
    const userId = getCurrentUserId();

    if (!groupId) {
        window.location.href = 'study-groups.html';
        return;
    }

    try {
        showLoadingOverlay();
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Group not found');
        }

        const responseData = await response.json();

        // Check if we received an error response
        if (responseData.status === 'error') {
            throw new Error(responseData.message || 'Group not found');
        }

        // Get the group data (either directly or from the data property)
        const group = responseData.data || responseData;

        updateGroupDetails(group);
        renderSessions(group.sessions, !!group.Owner, group.id);
        showAddSessionButton(!!group.Owner);
    } catch (error) {
        console.error('Error loading group details:', error);
        document.querySelector('.container').innerHTML = `
            <div class="alert alert-danger">
                <h4>Error Loading Group</h4>
                <p>${error.message}</p>
                <a href="study-groups.html" class="btn btn-primary">Back to Groups</a>
            </div>
        `;
    } finally {
        hideLoadingOverlay();
    }
}

function updateGroupDetails(group) {
    document.querySelector('.page-title').textContent = group.title;
    document.querySelector('.page-description').textContent = `${group.category} | Meets: ${formatMeetingDays(group.Days)} ${formatMeetingTime(group.meetingTime)}`;

    const aboutSection = document.querySelector('.card-body');
    aboutSection.innerHTML = `
        <h2 class="card-title h4 mb-3">About This Group</h2>
        <p class="card-text">${group.description || 'No description available'}</p>

        <div class="my-4">
            <h3 class="h5">Meeting Details</h3>
            <div class="meeting-details-container">
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="meeting-detail-card card h-100">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="meeting-icon bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                        <i class="fas fa-calendar-alt text-primary"></i>
                                    </div>
                                    <div>
                                        <h6 class="card-title mb-1">Schedule</h6>
                                        <p class="card-text text-muted mb-0">${formatMeetingDays(group.Days)}</p>
                                    </div>
                                </div>
                                <div class="meeting-time">
                                    <div class="time-slot d-flex align-items-center justify-content-between p-2 bg-light rounded">
                                        <span><i class="fas fa-clock text-primary me-2"></i>${formatMeetingTime(group.meetingTime)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="meeting-detail-card card h-100">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="meeting-icon bg-success bg-opacity-10 rounded-circle p-3 me-3">
                                        <i class="fas fa-map-marker-alt text-success"></i>
                                    </div>
                                    <div>
                                        <h6 class="card-title mb-1">Location</h6>
                                        <p class="card-text text-muted mb-0">${group.location}</p>
                                    </div>
                                </div>
                                <div class="location-details">
                                    <div class="d-flex align-items-center p-2 bg-light rounded">
                                        <i class="fas fa-building text-success me-2"></i>
                                        <span>${formatLocation(group.location)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="meeting-detail-card card h-100">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="meeting-icon bg-info bg-opacity-10 rounded-circle p-3 me-3">
                                        <i class="fas fa-users text-info"></i>
                                    </div>
                                    <div>
                                        <h6 class="card-title mb-1">Group Size</h6>
                                        <p class="card-text text-muted mb-0">Current: ${group.currentMembers}/${group.maxMembers} members</p>
                                    </div>
                                </div>
                                <div class="progress" style="height: 10px;">
                                    <div class="progress-bar bg-info" role="progressbar" 
                                        style="width: ${(group.currentMembers / group.maxMembers) * 100}%;" 
                                        aria-valuenow="${(group.currentMembers / group.maxMembers) * 100}" 
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                    </div>
                                </div>
                                <small class="text-muted mt-2 d-block">Spots available: ${group.maxMembers - group.currentMembers}</small>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="meeting-detail-card card h-100">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="meeting-icon bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                                        <i class="fas fa-tools text-warning"></i>
                                    </div>
                                    <div>
                                        <h6 class="card-title mb-1">Requirements</h6>
                                        <p class="card-text text-muted mb-0">What to bring</p>
                                    </div>
                                </div>
                                <div class="requirements-list">
                                    ${formatRequirements(group.requirements)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="my-4">
            <h3 class="h5">Group Resources</h3>
            <div class="resources-container">
                ${Array.isArray(group.resources) && group.resources.length > 0 
                    ? `<div class="row g-3">
                        ${group.resources.map(resource => `
                            <div class="col-md-6">
                                <div class="resource-card card h-100">
                                    <div class="card-body">
                                        <div class="resource-header d-flex align-items-center mb-3">
                                            <div class="resource-icon bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                                <i class="fas ${getResourceIcon(resource.type)} text-primary"></i>
                                            </div>
                                            <div>
                                                <h6 class="card-title mb-1">${resource.title}</h6>
                                                <small class="text-muted">Last updated: ${formatDate(resource.lastUpdated)}</small>
                                            </div>
                                            ${resource.addedBy ? `
                                                <div class="ms-auto">
                                                    <span class="badge bg-light text-dark">
                                                        <i class="fas fa-user me-1"></i>
                                                        Added by: ${resource.addedBy}
                                                    </span>
                                                </div>
                                            ` : ''}
                                        </div>
                                        <p class="card-text small text-muted mb-3">${resource.description}</p>
                                        <div class="resource-meta d-flex justify-content-between align-items-center">
                                            <span class="badge bg-light text-dark">
                                                <i class="fas ${getResourceBadgeIcon(resource.type)} me-1"></i>
                                                ${getResourceTypeText(resource.type)}
                                            </span>
                                            <a href="${resource.url}" class="btn btn-sm ${getResourceButtonClass(resource.type)}" target="_blank">
                                                <i class="fas ${getResourceActionIcon(resource.type)} me-1"></i>
                                                ${getResourceActionText(resource.type)}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                    : `<div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        No resources have been added to this group yet.
                    </div>`
                }
            </div>
        </div>

        <div class="my-4">
            <h3 class="h5">Discussion</h3>
            <div class="discussion-section">
                <!-- Discussion content will be injected here -->
            </div>
        </div>
    `;

    const joinButton = document.querySelector('.join-group-btn');
    if (joinButton) {
        joinButton.style.display = '';
        if (group.currentMembers >= group.maxMembers) {
            joinButton.innerHTML = '<button class="btn" style="background-color: rgb(255, 0, 0); color: white;" disabled>Group is Full</button>';
            joinButton.className = 'join-group-btn';
            joinButton.disabled = true;
        } else if (group.Joined) {
            joinButton.innerHTML = '<button class="btn btn-success" disabled><i class="fas fa-check me-2"></i>Joined</button>';
            joinButton.className = 'join-group-btn';
            joinButton.disabled = true;
        } else {
            joinButton.innerHTML = '<button class="btn btn-success" onclick="joinGroup(\'' + group.id + '\')"><i class="fas fa-user-plus me-2"></i>Join</button>';
            joinButton.className = 'join-group-btn';
            joinButton.disabled = false;
        }
    }

    const backButtonContainer = document.querySelector('.f-flex');
    if (backButtonContainer) {
        if (group.Owner) {
            const ownerButtons = `
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary" onclick="editGroup('${group.id}')">
                        <i class="fas fa-edit me-2"></i>Edit Group
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteGroup('${group.id}')">
                        <i class="fas fa-trash me-2"></i>Delete Group
                    </button>
                </div>
            `;
            backButtonContainer.classList.remove('f-flex');
            backButtonContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center');
            backButtonContainer.insertAdjacentHTML('beforeend', ownerButtons);
        } else if (group.Joined) {
            const exitButton = `
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-danger" onclick="exitGroup('${group.id}')">
                        <i class="fas fa-sign-out-alt me-2"></i>Exit Group
                    </button>
                </div>
            `;
            backButtonContainer.classList.remove('f-flex');
            backButtonContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center');
            backButtonContainer.insertAdjacentHTML('beforeend', exitButton);
        }
    }

    const resourcesContainer = document.querySelector('.resources-container');
    if (resourcesContainer) {
        let resourcesHtml = '';

        if (Array.isArray(group.resources) && group.resources.length > 0) {

            const whatsappResources = group.resources.filter(r => r.type === 'whatsapp');
            if (whatsappResources.length > 0) {
                const whatsapp = whatsappResources[0]; 
                resourcesHtml += `
                    <div class="whatsapp-card card mb-3">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="whatsapp-icon bg-success bg-opacity-10 rounded-circle p-3 me-3">
                                    <i class="fab fa-whatsapp text-success fa-2x"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="card-title mb-1">${whatsapp.title}</h6>
                                    <p class="card-text small text-muted mb-2">${whatsapp.description}</p>
                                </div>
                                <a href="${whatsapp.url}" target="_blank" class="btn btn-success">
                                    <i class="fab fa-whatsapp me-1"></i> Join Now
                                </a>
                            </div>
                            <div class="whatsapp-stats mt-3 d-flex justify-content-between text-muted small">
                                <span><i class="fas fa-users me-1"></i> Group Discussion</span>
                                <span><i class="fas fa-comments me-1"></i> Daily updates</span>
                                <span><i class="fas fa-bell me-1"></i> Instant notifications</span>
                            </div>
                        </div>
                    </div>`;
            }

            // Then render other resources
            const otherResources = group.resources.filter(r => r.type !== 'whatsapp');
            if (otherResources.length > 0) {
                resourcesHtml += `<div class="row g-3">
                    ${otherResources.map(resource => `
                        <div class="col-md-6">
                            <div class="resource-card card h-100">
                                <div class="card-body">
                                    <div class="resource-header d-flex align-items-center mb-3">
                                        <div class="resource-icon bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                            <i class="fas ${getResourceIcon(resource.type)} text-primary"></i>
                                        </div>
                                        <div>
                                            <h6 class="card-title mb-1">${resource.title}</h6>
                                            <small class="text-muted">Last updated: ${formatDate(resource.lastUpdated)}</small>
                                        </div>
                                        ${resource.addedBy ? `
                                            <div class="ms-auto">
                                                <span class="badge bg-light text-dark">
                                                    <i class="fas fa-user me-1"></i>
                                                    Added by: ${resource.addedBy}
                                                </span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <p class="card-text small text-muted mb-3">${resource.description}</p>
                                    <div class="resource-meta d-flex justify-content-between align-items-center">
                                        <span class="badge bg-light text-dark">
                                            <i class="fas ${getResourceBadgeIcon(resource.type)} me-1"></i>
                                            ${getResourceTypeText(resource.type)}
                                        </span>
                                        <a href="${resource.url}" class="btn btn-sm ${getResourceButtonClass(resource.type)}" target="_blank">
                                            <i class="fas ${getResourceActionIcon(resource.type)} me-1"></i>
                                            ${getResourceActionText(resource.type)}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            }
        } else {
            resourcesHtml = `<div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No resources have been added to this group yet.
            </div>`;
        }

        // if user joins or is the owner, they can add resources
        if (group.Owner || group.Joined) {
            resourcesHtml += `
                <div class="add-resource-card card mt-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="card-title mb-0">Add New Resource</h6>
                            <button class="btn btn-primary btn-sm" onclick="showAddResourceForm()">
                                <i class="fas fa-plus me-1"></i>Add Resource
                            </button>
                        </div>
                        <div id="addResourceFormContainer" style="display: none;">
                            <form id="addResourceForm" class="mt-3">
                                <div class="mb-3">
                                    <label class="form-label">Resource Title</label>
                                    <input type="text" class="form-control" name="title" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Resource Type</label>
                                    <select class="form-select" name="type" required>
                                        <option value="whatsapp">WhatsApp Group</option>
                                        <option value="pdf">PDF Document</option>
                                        <option value="link">External Link</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" name="description" rows="2" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Resource URL</label>
                                    <input type="url" class="form-control" name="url" required>
                                    <small class="text-muted" id="urlHelpText"></small>
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-success">
                                        <i class="fas fa-save me-1"></i>Save Resource
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="hideAddResourceForm()">
                                        <i class="fas fa-times me-1"></i>Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>`;
        }

        resourcesContainer.innerHTML = resourcesHtml;

        // Add event listeners to the add resource form
        const addResourceForm = document.getElementById('addResourceForm');
        if (addResourceForm) {
            addResourceForm.onsubmit = (e) => handleAddResource(e, group.Owner ? 'Owner' : 'Member');

            // Add type change listener to show help text
            const typeSelect = addResourceForm.querySelector('select[name="type"]');
            const urlHelpText = document.getElementById('urlHelpText');

            typeSelect.addEventListener('change', (e) => {
                switch (e.target.value) {
                    case 'whatsapp':
                        urlHelpText.textContent = 'Enter the WhatsApp group invite link';
                        break;
                    case 'pdf':
                        urlHelpText.textContent = 'Enter the URL where the PDF is hosted';
                        break;
                    case 'video':
                        urlHelpText.textContent = 'Enter the video URL (YouTube, Vimeo, etc.)';
                        break;
                    case 'link':
                        urlHelpText.textContent = 'Enter the website URL';
                        break;
                    default:
                        urlHelpText.textContent = '';
                }
            });

            // Trigger change event to show initial help text
            typeSelect.dispatchEvent(new Event('change'));
        }
    }

    // Update the group discussion add new chats
    const discussionSection = document.querySelector('.discussion-section');
    if (discussionSection) {
        let discussionHtml = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="card-title h4 mb-0">Discussion</h2>
                        <span class="badge bg-primary">
                            <i class="fas fa-comments me-1"></i>
                            ${Array.isArray(group.groupChat) ? group.groupChat.length : 0} messages
                        </span>
                    </div>

                    <div class="chat-messages mb-4" style="max-height: 400px; overflow-y: auto;">
                        ${renderChatMessages(group.groupChat)}
                    </div>

                    ${(group.Owner || group.Joined) ? `
                        <form id="chatForm" class="mt-4">
                            <div class="mb-3">
                                <label for="messageText" class="form-label">Add a message</label>
                                <textarea class="form-control" id="messageText" name="messageText" 
                                    rows="3" placeholder="Write your message here..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane me-1"></i>Send Message
                            </button>
                        </form>
                    ` : `
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Join the group to participate in discussions
                        </div>
                    `}
                </div>
            </div>
        `;

        discussionSection.innerHTML = discussionHtml;

        // Add event listener for the chat form if it exists
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.onsubmit = handleChatSubmit;
        }
    }
}

function getResourceIcon(type) {
    switch (type) {
        case 'pdf': return 'fa-file-pdf';
        case 'link': return 'fa-link';
        case 'video': return 'fa-video';
        case 'whatsapp': return 'fa-whatsapp';
        default: return 'fa-file';
    }
}

function getResourceBadgeIcon(type) {
    switch (type) {
        case 'pdf': return 'fa-file-alt';
        case 'link': return 'fa-external-link-alt';
        case 'video': return 'fa-video';
        case 'whatsapp': return 'fa-whatsapp';
        default: return 'fa-file';
    }
}

function getResourceTypeText(type) {
    switch (type) {
        case 'pdf': return 'PDF Document';
        case 'link': return 'External Link';
        case 'video': return 'Video';
        case 'whatsapp': return 'WhatsApp Group';
        default: return 'Resource';
    }
}

function getResourceButtonClass(type) {
    switch (type) {
        case 'pdf': return 'btn-outline-primary';
        case 'link': return 'btn-outline-success';
        case 'video': return 'btn-outline-info';
        case 'whatsapp': return 'btn-outline-success';
        default: return 'btn-outline-secondary';
    }
}

function getResourceActionIcon(type) {
    switch (type) {
        case 'pdf': return 'fa-download';
        case 'link': return 'fa-external-link-alt';
        case 'video': return 'fa-play';
        case 'whatsapp': return 'fa-whatsapp';
        default: return 'fa-download';
    }
}

function getResourceActionText(type) {
    switch (type) {
        case 'pdf': return 'Download';
        case 'link': return 'Visit';
        case 'video': return 'Watch';
        case 'whatsapp': return 'Join Group';
        default: return 'Download';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Unified joinGroup function - modified to work with PHP backend
async function joinGroup(groupId) {
    try {
        const userId = getCurrentUserId();

        if (!userId) {
            alert('Please sign in to join a group');
            window.location.href = '/ITCS-333-Project/Home_Page/HTML_Pages/signin.html';
            return;
        }

        // First get the current group data
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }

        const group = await response.json();

        if (group.currentMembers >= group.maxMembers) {
            alert('This group is already full');
            return;
        }

        // Set Joined to true and send update request
        const updateResponse = await fetch(`${API_URL}/update.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: groupId,
                user_id: userId,
                Joined: true
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to join group');
        }

        const updateData = await updateResponse.json();

        if (updateData.status === 'error') {
            throw new Error(updateData.message);
        }

        // Show SweetAlert2 dialog or fall back to alert
        const showDialog = () => {
            if (window.Swal) {
                Swal.fire({
                    icon: 'success',
                    title: `You joined the group!`,
                    text: `Welcome to "${group.title}"`,
                    showConfirmButton: false,
                    timer: 1800,
                    timerProgressBar: true,
                    willClose: () => {
                        if (window.location.pathname.includes('view-group.html')) {
                            loadGroupDetails();
                        } else {
                            window.location.href = `view-group.html?id=${groupId}`;
                        }
                    }
                });
            } else {
                alert(`You joined the group: ${group.title}`);
                if (window.location.pathname.includes('view-group.html')) {
                    window.location.reload();
                } else {
                    window.location.href = `view-group.html?id=${groupId}`;
                }
            }
        };

        showDialog();
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Failed to join group: ' + error.message);
    }
}
async function deleteGroup(groupId) {
    const userId = getCurrentUserId();

    if (!window.Swal) {
        // Fallback if SweetAlert2 is not available
        if (confirm('Are you sure you want to delete this group?')) {
            try {
                const response = await fetch(`${API_URL}/delete.php?id=${groupId}&user_id=${userId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete group');
                }

                const responseData = await response.json();

                if (responseData.status === 'error') {
                    throw new Error(responseData.message);
                }

                alert('Group deleted successfully!');
                loadStudyGroups(); // Reload the groups list
            } catch (error) {
                console.error('Error deleting group:', error);
                alert('Failed to delete group. ' + error.message);
            }
        }
        return;
    }

    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this group?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
    });
    if (result.isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/delete.php?id=${groupId}&user_id=${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete group');
            }

            const responseData = await response.json();

            if (responseData.status === 'error') {
                throw new Error(responseData.message);
            }

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Group has been deleted.',
                timer: 1800,
                showConfirmButton: false,
                timerProgressBar: true
            });

            loadStudyGroups(); // Reload the groups list
        } catch (error) {
            Swal.fire({
               icon: 'success',
                title: 'Deleted!',
                text: 'Group has been deleted.',
                timer: 1800,
                showConfirmButton: false,
                timerProgressBar: true,
                willClose: () => {
                    window.location.href = 'study-groups.html';
                }
            });
            loadStudyGroups();
        }
    }
} 
async function exitGroup(groupId) {
    const userId = getCurrentUserId();

    if (!window.Swal) {
        // Fallback if SweetAlert2 is not available
        if (confirm('Are you sure you want to exit this group?')) {
            try {
                const response = await fetch(`${API_URL}/update.php`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: groupId,
                        user_id: userId,
                        Joined: false
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to exit group');
                }

                const responseData = await response.json();

                if (responseData.status === 'error') {
                    throw new Error(responseData.message);
                }

                alert('You have successfully exited the group!');
                window.location.href = 'study-groups.html';
            } catch (error) {
                console.error('Error exiting group:', error);
                alert('Failed to exit group: ' + error.message);
            }
        }
        return;
    }

    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will leave this study group.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, exit group',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/update.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: groupId,
                    user_id: userId,
                    Joined: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to exit group');
            }

            const responseData = await response.json();

            if (responseData.status === 'error') {
                throw new Error(responseData.message);
            }

            // Show success message and then redirect
            await Swal.fire({
                icon: 'success',
                title: 'Exited Group',
                text: 'You have successfully exited the group.',
                timer: 1800,
                showConfirmButton: false,
                timerProgressBar: true,
                willClose: () => {
                    window.location.href = 'study-groups.html';
                }
            });

        } catch (error) {
            console.error('Error exiting group:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to exit',
                text: error.message
            });
        }
    }
}
function renderSessions(sessions, isOwner, groupId) {
    const container = document.querySelector('.sessions-container');
    if (!Array.isArray(sessions) || sessions.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No upcoming sessions.</div>';
        return;
    }
    container.innerHTML = '<div class="row g-3">' + sessions.map((session, idx) => {
        let badgeClass = session.status === 'Ongoing' ? 'bg-warning' : 'bg-secondary';
        let sessionTypeIcon = session.sessionType === 'study' ? 'fa-book-open text-primary' : 'fa-question-circle text-success';
        let sessionTypeText = session.sessionType === 'study' ? 'Study Session' : 'Practice Session';
        let markCompletedBtn = '';
        if (isOwner && session.status === 'Ongoing') {
            markCompletedBtn = `<button class='btn btn-sm btn-outline-success mt-3 ms-2' onclick='markSessionCompleted(${idx}, "${groupId}")'><i class="fas fa-check me-1"></i>Mark as Completed</button>`;
        }
        return `
        <div class="col-12">
          <div class="session-card card hover-animate">
            <div class="card-body">
              <div class="session-header d-flex justify-content-between align-items-center mb-3">
                <div class="session-date">
                  <div class="date-badge bg-primary text-white rounded-3 p-2">
                    <div class="d-flex flex-column align-items-center">
                      <span class="fw-bold fs-5">${session.day}</span>
                      <span class="small">${session.month}</span>
                      <span class="small">${session.year}</span>
                    </div>
                  </div>
                </div>
                <div class="session-time">
                  <span class="badge bg-light text-dark">
                    <i class="fas fa-clock text-primary me-1"></i>
                    ${session.time}
                  </span>
                </div>
              </div>
              <h5 class="session-title mb-3">${session.title}</h5>
              <div class="session-progress mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Status</span>
                  <span class="badge ${badgeClass}">${session.status}</span>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar ${badgeClass}" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
              <div class="session-details">
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="detail-item p-2 bg-light rounded">
                      <i class="fas fa-book text-primary me-2"></i>
                      <span>Topics: ${session.topics}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="detail-item p-2 bg-light rounded">
                      <i class="fas ${sessionTypeIcon} me-2"></i>
                      <span>${sessionTypeText}</span>
                    </div>
                  </div>
                </div>
              </div>
              ${isOwner ? `<button class='btn btn-sm btn-outline-danger mt-3' onclick='removeSession(${idx}, "${groupId}")'><i class="fas fa-trash me-1"></i>Remove</button>` : ''}
              ${markCompletedBtn}
            </div>
          </div>
        </div>
    `;}).join('') + '</div>';
}

function showAddSessionButton(isOwner) {
    const btnContainer = document.querySelector('.add-session-btn-container');
    if (isOwner) {
        btnContainer.innerHTML = `<button class="btn btn-primary w-100 mt-3" onclick="addSessionForm()"><i class="fas fa-plus me-2"></i>Add Session</button>`;
    } else {
        btnContainer.innerHTML = '';
    }
}

function addSessionForm() {
    const container = document.querySelector('.sessions-container');
    const oldForm = document.getElementById('add-session-form');
    if (oldForm) oldForm.remove();

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const formHtml = `
      <form id="add-session-form" class="card p-3 mb-3">
        <div class="row g-2">
          <div class="col-md-3"><input type="number" class="form-control" name="day" placeholder="Day" min="1" max="31" required></div>
          <div class="col-md-3">
            <select class="form-select" name="month" required>
              <option value="" disabled selected>Month</option>
              ${months.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3"><input type="number" class="form-control" name="year" placeholder="Year" min="2023" required></div>
          <div class="col-md-3">
            <input type="time" class="form-control" name="time" required>
          </div>
        </div>
        <input type="text" class="form-control mt-2" name="title" placeholder="Session Title" required>
        <input type="text" class="form-control mt-2" name="topics" placeholder="Topics" required>
        <select class="form-select mt-2" name="status">
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
        <select class="form-select mt-2" name="sessionType">
          <option value="study">Study Session</option>
          <option value="practice">Practice Session</option>
        </select>
        <button type="submit" class="btn btn-success mt-2">Add Session</button>
        <button type="button" class="btn btn-secondary mt-2 ms-2" onclick="cancelAddSession()">Cancel</button>
      </form>
    `;
    container.insertAdjacentHTML('afterbegin', formHtml);
    document.getElementById('add-session-form').onsubmit = handleAddSession;
}

function cancelAddSession() {
    loadGroupDetails();
}

async function handleAddSession(e) {
    e.preventDefault();
    const form = e.target;
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');
    const userId = getCurrentUserId();

    try {
        // First get current group data
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        // Create new session object
        const newSession = {
            day: form.day.value,
            month: form.month.value,
            year: form.year.value,
            time: form.time.value,
            title: form.title.value,
            topics: form.topics.value,
            status: form.status.value,
            sessionType: form.sessionType.value
        };

        // Add to sessions array
        const sessions = Array.isArray(group.sessions) ? [...group.sessions, newSession] : [newSession];

        // Update group with new sessions
        const updateResponse = await fetch(`${API_URL}/update.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: groupId,
                user_id: userId,
                sessions: sessions
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to add session');
        }

        loadGroupDetails();
    } catch (error) {
        console.error('Error adding session:', error);
        alert('Failed to add session: ' + error.message);
    }
}

async function removeSession(idx, groupId) {
    if (!confirm('Remove this session?')) return;

    try {
        const userId = getCurrentUserId();

        // Get current group data
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        // Remove session at index
        const sessions = Array.isArray(group.sessions) ? [...group.sessions] : [];
        sessions.splice(idx, 1);

        // Update group with modified sessions
        const updateResponse = await fetch(`${API_URL}/update.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: groupId,
                user_id: userId,
                sessions: sessions
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to remove session');
        }

        loadGroupDetails();
    } catch (error) {
        console.error('Error removing session:', error);
        alert('Failed to remove session: ' + error.message);
    }
}

async function markSessionCompleted(idx, groupId) {
    try {
        const userId = getCurrentUserId();

        // Get current group data
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        // Update session status at index
        const sessions = Array.isArray(group.sessions) ? [...group.sessions] : [];
        if (sessions[idx]) {
            sessions[idx].status = 'Completed';
        }

        // Update group with modified sessions
        const updateResponse = await fetch(`${API_URL}/update.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: groupId,
                user_id: userId,
                sessions: sessions
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to update session');
        }

        loadGroupDetails();
    } catch (error) {
        console.error('Error updating session:', error);
        alert('Failed to update session: ' + error.message);
    }
}

function showAddResourceForm() {
    const formContainer = document.getElementById('addResourceFormContainer');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

function hideAddResourceForm() {
    const formContainer = document.getElementById('addResourceFormContainer');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function handleAddResource(e, userRole) {
    e.preventDefault();
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const groupId = urlParams.get('id');
        const userId = getCurrentUserId();

        // Get current group data
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        const formData = new FormData(e.target);

        // Create new resource object
        const newResource = {
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            url: formData.get('url'),
            lastUpdated: new Date().toISOString(),
            addedBy: userRole // Add information about who added the resource
        };

        // Add the new resource to the group's resources array
        const resources = Array.isArray(group.resources) ? [...group.resources, newResource] : [newResource];

        // Update the group with the new resource
        const updateResponse = await fetch(`${API_URL}/update.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: groupId,
                user_id: userId,
                resources: resources
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to add resource');
        }

        const responseData = await updateResponse.json();

        if (responseData.status === 'error') {
            throw new Error(responseData.message);
        }

        // Show success message
        alert('Resource added successfully!');

        // Hide the form and reload group details
        hideAddResourceForm();
        await loadGroupDetails();
    } catch (error) {
        console.error('Error adding resource:', error);
        alert('Failed to add resource: ' + error.message);
    }
}

function renderChatMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return `
            <div class="text-center text-muted my-4">
                <i class="fas fa-comments fa-2x mb-2"></i>
                <p>No messages yet. Be the first to start the discussion!</p>
            </div>
        `;
    }

    return messages.map(message => `
        <div class="chat-message ${message.isOwner ? 'owner' : ''} mb-3">
            <div class="d-flex align-items-start">
                <div class="message-avatar bg-${message.isOwner ? 'primary' : 'secondary'} bg-opacity-10 rounded-circle p-2 me-2">
                    <i class="fas fa-user text-${message.isOwner ? 'primary' : 'secondary'}"></i>
                </div>
                <div class="message-content flex-grow-1">
                    <div class="message-header d-flex justify-content-between align-items-center mb-1">
                        <span class="message-author fw-bold ${message.isOwner ? 'text-primary' : ''}">
                            ${message.author} ${message.isOwner ? '(Owner)' : ''}
                        </span>
                        <small class="text-muted">${formatChatDate(message.timestamp)}</small>
                    </div>
                    <div class="message-text bg-light rounded p-2">
                        ${message.text}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function formatChatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }
}

async function handleChatSubmit(e) {
    e.preventDefault();
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const groupId = urlParams.get('id');
        const userId = getCurrentUserId();

        if (!userId) {
            alert('Please sign in to send messages');
            window.location.href = '/ITCS-333-Project/Home_Page/HTML_Pages/signin.html';
            return;
        }

        // Get current group data
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        const messageText = e.target.messageText.value.trim();
        if (!messageText) return;

        // Create new message object
        const newMessage = {
            text: messageText,
            author: group.Owner ? 'Group Owner' : 'Group Member',
            isOwner: group.Owner,
            timestamp: new Date().toISOString()
        };

        // Add the new message to the group's chat array
        const groupChat = Array.isArray(group.groupChat) ? [...group.groupChat, newMessage] : [newMessage];

        // Update the group with the new message
        const updateResponse = await fetch(`${API_URL}/update.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: groupId,
                user_id: userId,
                groupChat: groupChat
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to send message');
        }

        const responseData = await updateResponse.json();

        if (responseData.status === 'error') {
            throw new Error(responseData.message);
        }

        // Clear the input field
        e.target.messageText.value = '';

        // Reload group details to show the new message
        await loadGroupDetails();

        // Scroll to the bottom of the chat
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message: ' + error.message);
    }
}

async function editGroup(groupId) {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`${API_URL}/read_single.php?id=${groupId}&user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        // Create edit form section
        const editSection = document.createElement('div');
        editSection.id = 'editGroupSection';
        editSection.className = 'card shadow-sm mb-4';
        editSection.innerHTML = `
            <div class="card-body">
                <h3 class="card-title h5 mb-3">Edit Group Details</h3>
                <form id="editGroupForm" class="edit-group-form">
                    <div class="mb-3">
                        <label class="form-label">Group Title</label>
                        <input type="text" class="form-control" id="edit-title" value="${group.title}" required>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" id="edit-description" rows="3" required>${group.description}</textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Meeting Days</label>
                        <div class="days-selection">
                            ${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].map(day => `
                                <button type="button" class="btn ${group.Days && group.Days.includes(day) ? 'btn-primary' : 'btn-outline-primary'} day-btn" 
                                    data-day="${day}" onclick="this.classList.toggle('btn-primary'); this.classList.toggle('btn-outline-primary');">
                                    ${day.charAt(0).toUpperCase() + day.slice(1)}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Meeting Time</label>
                        <input type="time" class="form-control" id="edit-meetingTime" 
                            value="${group.meetingTime ? new Date(group.meetingTime * 1000).toTimeString().slice(0,5) : ''}" required>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Location</label>
                            <select class="form-select" id="edit-location" required>
                                ${['s40', 's50', 's1b', 's1a', 'it_food_court']
                                    .map(loc => `<option value="${loc}" ${group.location === loc ? 'selected' : ''}>${loc.toUpperCase()}</option>`)
                                    .join('')}
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Maximum Members</label>
                            <input type="number" class="form-control" id="edit-maxMembers" min="2" max="8" value="${group.maxMembers}" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Requirements</label>
                        <div class="requirements-checkboxes">
                            ${['laptop', 'notes', 'headphones'].map(req => `
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="edit-req-${req}" 
                                        ${group.requirements && group.requirements.includes(req) ? 'checked' : ''}>
                                    <label class="form-check-label" for="edit-req-${req}">
                                        <i class="fas fa-${req === 'laptop' ? 'laptop' : req === 'notes' ? 'book' : 'headphones'} me-2"></i>
                                        ${req.charAt(0).toUpperCase() + req.slice(1)}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save me-2"></i>Save Changes
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="cancelEdit()">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Replace the group details with edit form
        const groupDetailsContainer = document.querySelector('.card-body');
        if (groupDetailsContainer) {
            groupDetailsContainer.innerHTML = editSection.innerHTML;
        } else {
            console.error('Could not find container for edit form');
            return;
        }

        // Add submit handler
        document.getElementById('editGroupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const selectedDays = Array.from(document.querySelectorAll('.day-btn.btn-primary'))
                .map(btn => btn.getAttribute('data-day'));

            const selectedRequirements = ['laptop', 'notes', 'headphones']
                .filter(req => document.getElementById(`edit-req-${req}`).checked);

            const timeValue = document.getElementById('edit-meetingTime').value;
            const meetingTime = timeValue ? new Date(`1970-01-01T${timeValue}`).getTime() / 1000 : null;

            const formData = {
                id: groupId,
                user_id: userId,
                title: document.getElementById('edit-title').value,
                description: document.getElementById('edit-description').value,
                location: document.getElementById('edit-location').value,
                maxMembers: parseInt(document.getElementById('edit-maxMembers').value),
                Days: selectedDays,
                meetingTime: meetingTime,
                requirements: selectedRequirements
            };

            try {
                const updateResponse = await fetch(`${API_URL}/update.php`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update group');
                }

                // Show success message and reload
                alert('Group updated successfully!');
                loadGroupDetails();
            } catch (error) {
                console.error('Error updating group:', error);
                alert('Failed to update group: ' + error.message);
            }
        });

    } catch (error) {
        console.error('Error editing group:', error);
        alert('Failed to edit group: ' + error.message);
    }
}

function cancelEdit() {
    const editSection = document.getElementById('editGroupSection');
    if (editSection) {
        editSection.remove();
    }
}

// Add CSS styles for the chat
const style = document.createElement('style');
style.textContent = `
    .chat-messages {
        scrollbar-width: thin;
        scrollbar-color: rgba(0,0,0,.2) transparent;
    }
    .chat-messages::-webkit-scrollbar {
        width: 6px;
    }
    .chat-messages::-webkit-scrollbar-track {
        background: transparent;
    }
    .chat-messages::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,.2);
        border-radius: 3px;
    }
    .chat-message.owner .message-text {
        background-color: #e3f2fd !important;
    }
    .message-avatar {
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .message-text {
        white-space: pre-wrap;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', loadGroupDetails);