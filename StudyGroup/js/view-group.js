const API_URL = 'https://6809eb641f1a52874cde5938.mockapi.io/GroupName';

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

async function loadGroupDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');

    if (!groupId) {
        window.location.href = 'study-groups.html';
        return;
    }

    try {
        showLoadingOverlay();
        const response = await fetch(`${API_URL}/${groupId}`);
        if (!response.ok) {
            throw new Error('Group not found');
        }

        const group = await response.json();
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

        // Add event listeners
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

    // Update the discussion section
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

// Unified joinGroup function for both main and group view pages
async function joinGroup(groupId) {
    try {
        const response = await fetch(`${API_URL}/${groupId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch group data');
        }
        const group = await response.json();

        if (group.currentMembers >= group.maxMembers) {
            alert('This group is already full');
            return;
        }

        const updatedGroup = {
            ...group,
            Joined: true,
            currentMembers: group.currentMembers + 1
        };

        const updateResponse = await fetch(`${API_URL}/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedGroup)
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to join group');
        }

        // Show SweetAlert2 dialog
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
                        // If on group view, reload details; else, redirect to group view
                        if (window.location.pathname.includes('view-group.html')) {
                            if (typeof loadGroupDetails === 'function') {
                                loadGroupDetails();
                            } else {
                                window.location.reload();
                            }
                        } else {
                            window.location.href = `view-group.html?id=${groupId}`;
                        }
                    }
                });
            } else {
                // Fallback if SweetAlert2 is not loaded
                alert(`You joined the group: ${group.title}`);
                if (window.location.pathname.includes('view-group.html')) {
                    window.location.reload();
                } else {
                    window.location.href = `view-group.html?id=${groupId}`;
                }
            }
        };

        // Wait for SweetAlert2 to load if needed
        if (window.Swal) {
            showDialog();
        } else {
            let tries = 0;
            const interval = setInterval(() => {
                if (window.Swal) {
                    clearInterval(interval);
                    showDialog();
                } else if (++tries > 20) {
                    clearInterval(interval);
                    alert(`You joined the group: ${group.title}`);
                    if (window.location.pathname.includes('view-group.html')) {
                        window.location.reload();
                    } else {
                        window.location.href = `view-group.html?id=${groupId}`;
                    }
                }
            }, 100);
        }
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Failed to join group. Please try again.');
    }
}

async function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_URL}/${groupId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete group');
            }

            alert('Group deleted successfully!');
            window.location.href = 'study-groups.html';
        } catch (error) {
            console.error('Error deleting group:', error);
            alert('Failed to delete group. Please try again.');
        }
    }
}

async function editGroup(groupId) {
    const response = await fetch(`${API_URL}/${groupId}`);
    const group = await response.json();
    const aboutSection = document.querySelector('.card-body');
    if (!aboutSection) return;

    // Build requirements checkboxes
    const requirements = [
        { value: 'laptop', label: 'Laptop/iPad' },
        { value: 'notes', label: 'Notes/Course Materials' },
        { value: 'headphones', label: 'Headphones' }
    ];
    const requirementsHtml = requirements.map(req => `
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="requirements" id="req-${req.value}" value="${req.value}" ${group.requirements && group.requirements.includes(req.value) ? 'checked' : ''}>
            <label class="form-check-label" for="req-${req.value}">${req.label}</label>
        </div>
    `).join('');

    // Location mapping from formatLocation
    const locationMap = {
        'S40': 'S40 Building',
        'S50': 'S50 Building',
        'S1B': 'S1B Building',
        'S1A': 'S1A Building',
        'IT Food Court': 'IT Food Court'
    };
    const locationOptions = Object.keys(locationMap).map(loc => `<option value="${loc}"${group.location === loc ? ' selected' : ''}>${locationMap[loc]}</option>`).join('');

    // Meeting days checkboxes
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysHtml = daysOfWeek.map(day => `
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="Days" id="day-${day}" value="${day}" ${group.Days && group.Days.includes(day) ? 'checked' : ''}>
            <label class="form-check-label" for="day-${day}">${day}</label>
        </div>
    `).join('');

    // Meeting time (convert from timestamp if needed)
    let meetingTimeValue = '';
    if (group.meetingTime) {
        const date = new Date(group.meetingTime * 1000);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        meetingTimeValue = `${hours}:${minutes}`;
    }

    aboutSection.innerHTML = `
        <form id="edit-group-form" class="p-3">
            <h2 class="h4 mb-3">Edit Group</h2>
            <div class="mb-2">
                <label class="form-label">Title</label>
                <input type="text" class="form-control" name="title" value="${group.title}" required>
            </div>
            <div class="mb-2">
                <label class="form-label">Category</label>
                <select class="form-select" name="category" id="categorySelect" onchange="updateCourseOptions()" required>
                    <option value="" disabled>Select Category</option>
                    ${Object.keys(courseMapping).map(cat => `
                        <option value="${cat}" ${group.category && group.category.toLowerCase() === cat ? 'selected' : ''}>
                            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label">Course</label>
                <select class="form-select" name="course" id="courseSelect" required>
                    <option value="" disabled>Select Course</option>
                    ${group.category ? courseMapping[group.category.toLowerCase()]?.map(course => `
                        <option value="${course.value}" ${group.course === course.value ? 'selected' : ''}>
                            ${course.text}
                        </option>
                    `).join('') : ''}
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description" rows="3" required>${group.description || ''}</textarea>
            </div>
            <div class="mb-2">
                <label class="form-label">Location</label>
                <select class="form-select" name="location" required>
                    ${locationOptions}
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label">Requirements</label><br>
                ${requirementsHtml}
            </div>
            <div class="mb-2">
                <label class="form-label">Meeting Days</label><br>
                ${daysHtml}
            </div>
            <div class="mb-2">
                <label class="form-label">Meeting Time</label>
                <input type="time" class="form-control" name="meetingTime" value="${meetingTimeValue}" required>
            </div>
            <div class="mb-2">
                <label class="form-label">Max Members</label>
                <input type="number" class="form-control" name="maxMembers" value="${group.maxMembers}" min="1" required>
            </div>
            <button type="submit" class="btn btn-success">Save Changes</button>
            <button type="button" class="btn btn-secondary ms-2" onclick="cancelEditGroup()">Cancel</button>
        </form>
    `;

    // Add the updateCourseOptions function
    window.updateCourseOptions = function() {
        const categorySelect = document.getElementById('categorySelect');
        const courseSelect = document.getElementById('courseSelect');
        const selectedCategory = categorySelect.value;
        
        if (selectedCategory && courseMapping[selectedCategory]) {
            courseSelect.innerHTML = `
                <option value="" disabled>Select Course</option>
                ${courseMapping[selectedCategory].map(course => `
                    <option value="${course.value}">${course.text}</option>
                `).join('')}
            `;
        } else {
            courseSelect.innerHTML = '<option value="" disabled>Select Category First</option>';
        }
    };

    document.getElementById('edit-group-form').onsubmit = handleEditGroupSubmit;
}

function cancelEditGroup() {
    loadGroupDetails();
}

async function handleEditGroupSubmit(e) {
    e.preventDefault();
    try {
        const form = e.target;
        const urlParams = new URLSearchParams(window.location.search);
        const groupId = urlParams.get('id');
        
        // Fetch current group data
        const response = await fetch(`${API_URL}/${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch group data');
        const group = await response.json();
        
        const formData = new FormData(form);

        // Handle meeting time
        let meetingTime = formData.get('meetingTime');
        let meetingTimeTimestamp = group.meetingTime;
        if (meetingTime) {
            const today = new Date();
            const [hours, minutes] = meetingTime.split(':');
            today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            meetingTimeTimestamp = Math.floor(today.getTime() / 1000);
        }

        // Get category and course details
        const selectedCategory = formData.get('category');
        const selectedCourse = formData.get('course');
        
        // Validate required fields
        if (!selectedCategory || !selectedCourse) {
            alert('Please select both category and course');
            return;
        }

        // Find course details from mapping
        const courseDetails = courseMapping[selectedCategory]?.find(c => c.value === selectedCourse);
        if (!courseDetails) {
            alert('Invalid course selection');
            return;
        }

        // Prepare updated group data
        const updatedGroup = {
            ...group,
            title: formData.get('title'),
            category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
            course: selectedCourse,
            courseText: courseDetails.text,
            description: formData.get('description'),
            location: formData.get('location'),
            maxMembers: parseInt(formData.get('maxMembers'), 10),
            requirements: formData.getAll('requirements'),
            Days: formData.getAll('Days'),
            meetingTime: meetingTimeTimestamp
        };

        // Send update request
        const updateResponse = await fetch(`${API_URL}/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedGroup)
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update group');
        }

        // Show success message
        alert('Group updated successfully!');
        
        // Reload group details
        await loadGroupDetails();
    } catch (error) {
        console.error('Error updating group:', error);
        alert('Failed to update group: ' + error.message);
    }
}

function formatMeetingDays(days) {
    if (!days || days.length === 0) return 'No meetings scheduled';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
}

function formatMeetingTime(timestamp) {
    if (!timestamp) return 'No time specified';
    
    const date = new Date(timestamp * 1000);
    
    let hours = date.getHours();
    let minutes = date.getMinutes();
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    minutes = minutes.toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${ampm}`;
}

function formatLocation(location) {
    const locationMap = {
        'S40': 'S40 Building',
        'S50': 'S50 Building',
        'S1B': 'S1B Building',
        'S1A': 'S1A Building',
        'IT Food Court': 'IT Food Court'
    };
    return locationMap[location] || location;
}

function formatRequirements(requirements) {
    if (!requirements || requirements.length === 0) {
        return '<p class="text-muted">No specific requirements</p>';
    }

    const requirementsMap = {
        'laptop': { icon: 'fa-laptop', text: 'Laptop/iPad' },
        'notes': { icon: 'fa-book', text: 'Notes/Course Materials' },
        'headphones': { icon: 'fa-headphones', text: 'Headphones' }
    };

    return requirements.map(req => {
        const requirement = requirementsMap[req];
        if (!requirement) return '';
        return `
            <div class="d-flex align-items-center mb-2">
                <i class="fas ${requirement.icon} text-warning me-2"></i>
                <span>${requirement.text}</span>
            </div>
        `;
    }).join('');
}

async function exitGroup(groupId) {
    if (confirm('Are you sure you want to exit this group?')) {
        try {
            const response = await fetch(`${API_URL}/${groupId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch group data');
            }
            const group = await response.json();

            const updatedGroup = {
                ...group,
                Joined: false,
                currentMembers: Math.max(0, group.currentMembers - 1)
            };

            const updateResponse = await fetch(`${API_URL}/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedGroup)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to exit group');
            }

            alert('You have successfully exited the group!');
            window.location.href = 'study-groups.html';
        } catch (error) {
            console.error('Error exiting group:', error);
            alert('Failed to exit group. Please try again.');
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
    const response = await fetch(`${API_URL}/${groupId}`);
    const group = await response.json();
    const sessions = Array.isArray(group.sessions) ? group.sessions : [];
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
    sessions.push(newSession);
    const updatedGroup = { ...group, sessions };
    await fetch(`${API_URL}/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGroup)
    });
    loadGroupDetails();
}

async function removeSession(idx, groupId) {
    if (!confirm('Remove this session?')) return;
    const response = await fetch(`${API_URL}/${groupId}`);
    const group = await response.json();
    const sessions = Array.isArray(group.sessions) ? group.sessions : [];
    sessions.splice(idx, 1);
    const updatedGroup = { ...group, sessions };
    await fetch(`${API_URL}/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGroup)
    });
    loadGroupDetails();
}

async function markSessionCompleted(idx, groupId) {
    const response = await fetch(`${API_URL}/${groupId}`);
    const group = await response.json();
    const sessions = Array.isArray(group.sessions) ? group.sessions : [];
    if (sessions[idx]) {
        sessions[idx].status = 'Completed';
    }
    const updatedGroup = { ...group, sessions };
    await fetch(`${API_URL}/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGroup)
    });
    loadGroupDetails();
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
        
        // Fetch current group data
        const response = await fetch(`${API_URL}/${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch group data');
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
        const resources = Array.isArray(group.resources) ? [...group.resources] : [];
        resources.push(newResource);

        // Update the group with the new resource
        const updateResponse = await fetch(`${API_URL}/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...group,
                resources: resources
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to add resource');
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
        
        // Fetch current group data
        const response = await fetch(`${API_URL}/${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch group data');
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
        const groupChat = Array.isArray(group.groupChat) ? [...group.groupChat] : [];
        groupChat.push(newMessage);

        // Update the group with the new message
        const updateResponse = await fetch(`${API_URL}/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...group,
                groupChat: groupChat
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to send message');
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