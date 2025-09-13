/*
 * College Management System - Frontend JavaScript
 * Integrates with Node.js backend APIs
 */

// Global variables
let currentUser = null;
let authToken = null;
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Clean URL parameters to prevent credential exposure
    cleanUrlParameters();
    
    // Check authentication status
    if (checkAuthStatus()) {
        const userType = localStorage.getItem('userType');
        showDashboard(userType);
        
        // Load statistics if user is admin
        if (userType === 'admin') {
            loadStatistics();
        }
    } else {
        // Initialize forms for login page
        initializeForms();
    }
}

// Clean URL parameters to prevent credential exposure
function cleanUrlParameters() {
    if (window.location.search || window.location.hash) {
        // Remove query parameters and hash from URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

// Initialize all forms
function initializeForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Reset password form
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
    
    // Add user form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
    
    // Edit user form
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', handleEditUser);
    }
    
    // Email validation for add user form
    const addUserEmailInput = document.getElementById('email');
    const addUserRoleSelect = document.getElementById('userRole');
    if (addUserEmailInput && addUserRoleSelect) {
        addUserEmailInput.addEventListener('input', () => {
            const role = addUserRoleSelect.value;
            showEmailValidation(addUserEmailInput, role);
        });
    }
    
    // Email validation for edit user form
    const editUserEmailInput = document.getElementById('editEmail');
    const editUserRoleSelect = document.getElementById('editUserRole');
    if (editUserEmailInput && editUserRoleSelect) {
        editUserEmailInput.addEventListener('input', () => {
            const role = editUserRoleSelect.value;
            showEmailValidation(editUserEmailInput, role);
        });
    }
    
    // Password strength checking
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };
    
    // Debug logging
    console.log('API Request:', url);
    console.log('Auth Token:', authToken ? 'Present' : 'Missing');
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            // Check for token expiration
            if (data.code === 'TOKEN_EXPIRED' || data.message === 'Token expired') {
                console.log('Token expired, logging out user');
                handleTokenExpiration();
                throw new Error('Your session has expired. Please log in again.');
            }
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Get form data
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="user-type"]:checked').value;
    
    // Validate inputs
    if (!validateLoginInputs(username, password)) {
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing In...';
    submitButton.disabled = true;
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password, role: userType })
        });
        
        // Store authentication data
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userType', userType);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show dashboard
        showDashboard(userType);
        
    } catch (error) {
        showError('login-error', error.message || 'Login failed');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function validateLoginInputs(username, password) {
    let isValid = true;
    
    if (!username) {
        showError('username-error', 'Username or email is required');
        isValid = false;
    } else if (username.length < 3) {
        showError('username-error', 'Username must be at least 3 characters long');
        isValid = false;
    }
    
    if (!password) {
        showError('password-error', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('password-error', 'Password must be at least 6 characters long');
        isValid = false;
    }
    
    return isValid;
}

// Dashboard Functions
function showDashboard(userType) {
    // Hide all pages
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show appropriate dashboard
    const dashboardId = `${userType}-dashboard`;
    const dashboard = document.getElementById(dashboardId);
    if (dashboard) {
        dashboard.classList.remove('hidden');
        loadDashboardData(userType);
    }
}

async function loadDashboardData(userType) {
    try {
        switch (userType) {
            case 'student':
                await loadStudentDashboard();
                break;
            case 'faculty':
                await loadFacultyDashboard();
                break;
            case 'admin':
                await loadAdminDashboard();
                await loadStatistics(); // Load statistics for admin dashboard
                break;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showModalMessage('Error loading dashboard data');
    }
}

// Student Dashboard Functions
async function loadStudentDashboard() {
    try {
        // Load student profile
        try {
            const profileResponse = await apiRequest('/student/profile');
            updateStudentProfile(profileResponse.student);
        } catch (error) {
            console.error('Error loading student profile:', error);
        }
        
        // Load grades
        try {
            const gradesResponse = await apiRequest('/student/grades');
            updateStudentGrades(gradesResponse.grades, gradesResponse.statistics);
        } catch (error) {
            console.error('Error loading student grades:', error);
        }
        
        // Load attendance
        try {
            const attendanceResponse = await apiRequest('/student/attendance');
            updateStudentAttendance(attendanceResponse.attendance, attendanceResponse.summary);
        } catch (error) {
            console.error('Error loading student attendance:', error);
        }
        
        // Load assignments
        try {
            const assignmentsResponse = await apiRequest('/student/assignments');
            updateStudentAssignments(assignmentsResponse.assignments);
        } catch (error) {
            console.error('Error loading student assignments:', error);
        }
        
        // Load assignments for submission dropdown
        try {
            await loadStudentAssignments();
        } catch (error) {
            console.error('Error loading assignment dropdown:', error);
        }
        
    } catch (error) {
        console.error('Error loading student dashboard:', error);
    }
}

function updateStudentProfile(student) {
    const profileCard = document.querySelector('#student-dashboard .bg-white:first-child');
    if (profileCard && student) {
        const nameElement = profileCard.querySelector('p.font-bold');
        const idElement = profileCard.querySelector('p.text-sm:nth-child(2)');
        const programElement = profileCard.querySelector('p.text-sm:nth-child(3)');
        const yearElement = profileCard.querySelector('p.text-sm:nth-child(4)');
        const emailElement = profileCard.querySelector('p.text-sm:nth-child(5)');
        
        if (nameElement) nameElement.textContent = `${student.userId.firstName} ${student.userId.lastName}`;
        if (idElement) idElement.textContent = `Student ID: ${student.enrollmentNumber}`;
        if (programElement) programElement.textContent = `Program: ${student.program}`;
        if (yearElement) yearElement.textContent = `Year: ${student.year}rd Year, Semester ${student.semester}`;
        if (emailElement) emailElement.textContent = `Email: ${student.userId.email}`;
    }
}

function updateStudentGrades(grades, statistics) {
    const gradesCard = document.querySelector('#student-dashboard .bg-white:nth-child(2)');
    if (gradesCard && grades) {
        const tbody = gradesCard.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
            grades.forEach(grade => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${grade.subjectName}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${grade.marks.obtained}/${grade.marks.total}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${grade.grade}</td>
                `;
                tbody.appendChild(row);
            });
        }
    }
}

function updateStudentAttendance(attendance, summary) {
    const attendanceCard = document.querySelector('#student-dashboard .bg-white:nth-child(6)');
    if (attendanceCard && summary) {
        const overallPercentage = summary.reduce((acc, sub) => acc + sub.attendancePercentage, 0) / summary.length;
        const progressCircle = attendanceCard.querySelector('.progress-circle');
        if (progressCircle) {
            progressCircle.textContent = `${Math.round(overallPercentage)}%`;
        }
    }
}

function updateStudentAssignments(assignments) {
    const assignmentsCard = document.querySelector('#student-dashboard .bg-white:nth-child(3)');
    if (assignmentsCard && assignments) {
        const ul = assignmentsCard.querySelector('ul');
        if (ul) {
            ul.innerHTML = '';
            assignments.forEach(assignment => {
                const li = document.createElement('li');
                li.className = 'bg-gray-50 border-l-4 border-[#8b3d4f] p-3 rounded-md';
                li.innerHTML = `
                    <p class="text-sm font-medium text-gray-800">${assignment.title}</p>
                    <p class="text-xs text-gray-500">Due: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
                    <p class="text-sm font-bold text-[#8b3d4f]">${assignment.submissionStatus === 'not_submitted' ? 'Pending' : 'Completed'}</p>
                `;
                ul.appendChild(li);
            });
        }
    }
}

// Faculty Dashboard Functions
async function loadFacultyDashboard() {
    try {
        // Load faculty profile
        const profileResponse = await apiRequest('/faculty/profile');
        updateFacultyProfile(profileResponse.faculty);
        
        // Load complaints
        const complaintsResponse = await apiRequest('/faculty/complaints');
        updateFacultyComplaints(complaintsResponse.complaints);
        
    } catch (error) {
        console.error('Error loading faculty dashboard:', error);
    }
}

function updateFacultyProfile(faculty) {
    const welcomeElement = document.querySelector('#faculty-dashboard h2');
    if (welcomeElement && faculty) {
        welcomeElement.textContent = `Welcome, ${faculty.userId.firstName} ${faculty.userId.lastName}`;
    }
}

function updateFacultyComplaints(complaints) {
    const complaintsCard = document.querySelector('#faculty-dashboard .bg-white:nth-child(5)');
    if (complaintsCard && complaints) {
        const ul = complaintsCard.querySelector('ul');
        if (ul) {
            ul.innerHTML = '';
            complaints.forEach(complaint => {
                const li = document.createElement('li');
                li.className = 'bg-gray-50 border-l-4 border-[#8b3d4f] p-3 rounded-md';
                li.innerHTML = `
                    <p class="text-sm text-gray-800"><strong class="font-medium">Student ID:</strong> ${complaint.enrollmentNumber}</p>
                    <p class="text-sm text-gray-700 leading-relaxed"><strong>Complaint:</strong> ${complaint.description}</p>
                `;
                ul.appendChild(li);
            });
        }
    }
}

// Admin Dashboard Functions
async function loadAdminDashboard() {
    try {
        // Load dashboard statistics
        const dashboardResponse = await apiRequest('/admin/dashboard');
        updateAdminDashboard(dashboardResponse.dashboard);
        
        // Load complaints
        const complaintsResponse = await apiRequest('/admin/complaints');
        updateAdminComplaints(complaintsResponse.complaints);
        
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

function updateAdminDashboard(dashboard) {
    const statsCard = document.querySelector('#admin-dashboard .bg-white:nth-child(2)');
    if (statsCard && dashboard.statistics) {
        const stats = dashboard.statistics;
        const ul = statsCard.querySelector('ul');
        if (ul) {
            ul.innerHTML = `
                <li>Total Students: <span class="font-medium">${stats.totalStudents}</span></li>
                <li>Total Faculty: <span class="font-medium">${stats.totalFaculty}</span></li>
                <li>Active Courses: <span class="font-medium">${stats.activeAssignments}</span></li>
            `;
        }
    }
}

function updateAdminComplaints(complaints) {
    const complaintsCard = document.querySelector('#admin-dashboard .bg-white:nth-child(4)');
    if (complaintsCard && complaints) {
        const ul = complaintsCard.querySelector('ul');
        if (ul) {
            ul.innerHTML = '';
            complaints.forEach(complaint => {
                const li = document.createElement('li');
                li.className = 'bg-gray-50 border-l-4 border-[#8b3d4f] p-3 rounded-md';
                li.innerHTML = `
                    <p class="text-sm text-gray-800"><strong class="font-medium">Department:</strong> ${complaint.department}</p>
                    <p class="text-sm text-gray-800"><strong class="font-medium">Student ID:</strong> ${complaint.enrollmentNumber}</p>
                    <p class="text-sm text-gray-700 leading-relaxed"><strong>Complaint:</strong> ${complaint.description}</p>
                `;
                ul.appendChild(li);
            });
        }
    }
}

// Student Functions
async function submitComplaint() {
    const complaintType = document.getElementById('complaint-type').value;
    const complaintDetails = document.getElementById('complaint-details').value;

    if (!complaintType || !complaintDetails.trim()) {
        showModalMessage("Please select a complaint type and provide details.");
        return;
    }

    try {
        const response = await apiRequest('/student/complaints', {
            method: 'POST',
            body: JSON.stringify({
                complaintType,
                subject: complaintType.charAt(0).toUpperCase() + complaintType.slice(1) + ' Issue',
                description: complaintDetails,
                priority: 'medium'
            })
        });

        showModalMessage("Your complaint has been submitted successfully!");
        
        // Clear form
        document.getElementById('complaint-type').value = '';
        document.getElementById('complaint-details').value = '';
        
    } catch (error) {
        showModalMessage("Error submitting complaint: " + error.message);
    }
}

// Faculty Functions
async function viewGrades() {
    const selectedCourse = document.querySelector('#faculty-dashboard select').value;
    if (!selectedCourse) {
        showModalMessage("Please select a course first.");
        return;
    }

    try {
        const response = await apiRequest(`/faculty/grades/subject/${selectedCourse}`);
        showModalMessage(`Displaying grades for ${selectedCourse}. Found ${response.grades.length} records.`);
    } catch (error) {
        showModalMessage("Error loading grades: " + error.message);
    }
}

// Handle token expiration
function handleTokenExpiration() {
    console.log('Handling token expiration...');
    
    // Clear all authentication data
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('currentUser');
    
    // Show login page
    showLoginPage();
    
    // Show notification
    showModalMessage('Your session has expired. Please log in again.');
}

// Faculty Functions
async function createNewAssignment() {
    try {
        showModalMessage('Create New Assignment functionality will be implemented soon!');
    } catch (error) {
        showModalMessage('Error creating assignment: ' + error.message);
    }
}

async function markAttendance() {
    try {
        showModalMessage('Mark Attendance functionality will be implemented soon!');
    } catch (error) {
        showModalMessage('Error marking attendance: ' + error.message);
    }
}

async function postFacultyAnnouncement() {
    try {
        showModalMessage('Post Faculty Announcement functionality will be implemented soon!');
    } catch (error) {
        showModalMessage('Error posting announcement: ' + error.message);
    }
}

async function postAdminAnnouncement() {
    try {
        showModalMessage('Post Admin Announcement functionality will be implemented soon!');
    } catch (error) {
        showModalMessage('Error posting announcement: ' + error.message);
    }
}

// Load assignments for student
async function loadStudentAssignments() {
    try {
        const response = await apiRequest('/student/assignments');
        
        if (response.success) {
            const assignmentSelect = document.getElementById('select-assignment');
            if (assignmentSelect) {
                // Clear existing options
                assignmentSelect.innerHTML = '<option value="">Choose an assignment...</option>';
                
                // Add assignments from API
                response.assignments.forEach(assignment => {
                    const option = document.createElement('option');
                    option.value = assignment._id; // Use the actual MongoDB ObjectId
                    option.textContent = assignment.title;
                    assignmentSelect.appendChild(option);
                });
                
                console.log('Loaded assignments:', response.assignments.length);
            }
        }
    } catch (error) {
        console.error('Error loading assignments:', error);
        // Keep the hardcoded options as fallback
    }
}

// Student Functions
async function submitAssignment() {
    try {
        // Verify authentication status
        if (!checkAuthStatus()) {
            showModalMessage('Please log in to submit assignments.');
            return;
        }
        
        // Check if user is a student
        if (currentUser.role !== 'student') {
            showModalMessage('Only students can submit assignments.');
            return;
        }
        
        const assignmentSelect = document.getElementById('select-assignment');
        const fileInput = document.getElementById('upload-file');
        
        if (!assignmentSelect.value) {
            showModalMessage('Please select an assignment to submit.');
            return;
        }
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showModalMessage('Please select a file to upload.');
            return;
        }
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('assignment', fileInput.files[0]);
        formData.append('assignmentId', assignmentSelect.value);
        
        console.log('Assignment ID being sent:', assignmentSelect.value);
        console.log('Assignment title:', assignmentSelect.options[assignmentSelect.selectedIndex].text);
        
        // Submit assignment to backend
        console.log('Submitting assignment with token:', authToken ? 'Present' : 'Missing');
        console.log('Current user:', currentUser);
        console.log('User role:', currentUser?.role);
        
        const response = await fetch(`${API_BASE_URL}/student/assignments/submit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Check for token expiration
            if (data.code === 'TOKEN_EXPIRED' || data.message === 'Token expired') {
                console.log('Token expired during assignment submission');
                handleTokenExpiration();
                return;
            }
            
            // Check for authentication errors
            if (data.message === 'Invalid or inactive user') {
                console.log('User authentication failed, logging out');
                handleTokenExpiration();
                return;
            }
            
            throw new Error(data.message || 'Assignment submission failed');
        }
        
        if (data.success) {
            showModalMessage(`Assignment "${assignmentSelect.options[assignmentSelect.selectedIndex].text}" submitted successfully!`);
            
            // Reset form
            assignmentSelect.value = '';
            fileInput.value = '';
        } else {
            showModalMessage('Error submitting assignment: ' + data.message);
        }
        
    } catch (error) {
        console.error('Assignment submission error:', error);
        showModalMessage('Error submitting assignment: ' + error.message);
    }
}

async function submitComplaint() {
    try {
        const complaintType = document.getElementById('complaint-type').value;
        const complaintDetails = document.getElementById('complaint-details').value.trim();
        
        if (!complaintType) {
            showModalMessage('Please select a complaint type.');
            return;
        }
        
        if (!complaintDetails) {
            showModalMessage('Please provide complaint details.');
            return;
        }
        
        if (complaintDetails.length > 150) {
            showModalMessage('Complaint details must be 150 words or less.');
            return;
        }
        
        // Submit complaint to backend
        const response = await apiRequest('/student/complaints', {
            method: 'POST',
            body: JSON.stringify({
                complaintType: complaintType,
                subject: complaintType.charAt(0).toUpperCase() + complaintType.slice(1) + ' Issue',
                description: complaintDetails,
                priority: 'medium'
            })
        });
        
        if (response.success) {
            showModalMessage('Complaint submitted successfully! We will review it soon.');
            
            // Reset form
            document.getElementById('complaint-type').value = '';
            document.getElementById('complaint-details').value = '';
            updateComplaintWordCount(); // Reset word count
        } else {
            showModalMessage('Error submitting complaint: ' + response.message);
        }
        
    } catch (error) {
        showModalMessage('Error submitting complaint: ' + error.message);
    }
}

// Word count function for complaint textarea
function updateComplaintWordCount() {
    const textarea = document.getElementById('complaint-details');
    const wordCountSpan = document.getElementById('complaint-word-count');
    
    if (textarea && wordCountSpan) {
        const text = textarea.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        
        wordCountSpan.textContent = wordCount;
        
        // Change color based on word count
        if (wordCount > 150) {
            wordCountSpan.className = 'text-red-500 font-bold';
        } else if (wordCount > 120) {
            wordCountSpan.className = 'text-orange-500 font-medium';
        } else {
            wordCountSpan.className = 'text-gray-500';
        }
    }
}

// Utility Functions
function logout() {
    // Clear authentication data
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('currentUser');
    
    // Hide all dashboards and show login page
    document.querySelectorAll('.dashboard-page').forEach(dashboard => {
        dashboard.classList.add('hidden');
    });
    document.getElementById('login-page').classList.remove('hidden');
}

// UI Helper Functions
function selectUserType(type) {
    // Remove active styling from all options
    document.querySelectorAll('[onclick^="selectUserType"]').forEach(option => {
        option.classList.remove('border-[#8b3d4f]', 'bg-[#f0d9dd]');
        option.classList.add('border-gray-200');
    });
    
    // Add active styling to selected option
    const selectedOption = document.querySelector(`[onclick="selectUserType('${type}')"]`);
    if (selectedOption) {
        selectedOption.classList.remove('border-gray-200');
        selectedOption.classList.add('border-[#8b3d4f]', 'bg-[#f0d9dd]');
    }
    
    // Check the radio button
    document.getElementById(type).checked = true;
}

function selectForgotUserType(type) {
    // Remove active styling from all options
    document.querySelectorAll('[onclick^="selectForgotUserType"]').forEach(option => {
        option.classList.remove('border-[#8b3d4f]', 'bg-[#f0d9dd]');
        option.classList.add('border-gray-200');
    });
    
    // Add active styling to selected option
    const selectedOption = document.querySelector(`[onclick="selectForgotUserType('${type}')"]`);
    if (selectedOption) {
        selectedOption.classList.remove('border-gray-200');
        selectedOption.classList.add('border-[#8b3d4f]', 'bg-[#f0d9dd]');
    }
    
    // Check the radio button
    document.getElementById(`forgot-${type}`).checked = true;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        `;
    }
}

function toggleNewPasswordVisibility() {
    const passwordInput = document.getElementById('new-password');
    const eyeIcon = document.getElementById('new-eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        `;
    }
}

function toggleConfirmPasswordVisibility() {
    const passwordInput = document.getElementById('confirm-password');
    const eyeIcon = document.getElementById('confirm-eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        `;
    }
}

function showForgotPassword() {
    const loginPage = document.getElementById('login-page');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    
    loginPage.classList.add('hidden');
    forgotPasswordPage.classList.remove('hidden');
    forgotPasswordPage.classList.add('page-transition');
}

function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    const resetPasswordPage = document.getElementById('reset-password-page');
    
    forgotPasswordPage.classList.add('hidden');
    resetPasswordPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginPage.classList.add('page-transition');
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearErrors() {
    const errorElements = ['username-error', 'password-error', 'login-error'];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthIndicator = document.getElementById('password-strength-indicator');
    
    if (!strengthIndicator) {
        const passwordField = document.getElementById('new-password').parentNode;
        const strengthDiv = document.createElement('div');
        strengthDiv.id = 'password-strength-indicator';
        strengthDiv.className = 'password-strength';
        strengthDiv.innerHTML = '<div class="password-strength-bar"></div>';
        passwordField.appendChild(strengthDiv);
    }
    
    const strength = calculatePasswordStrength(password);
    const strengthBar = document.querySelector('.password-strength-bar');
    
    strengthBar.className = 'password-strength-bar';
    
    if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#e5e7eb';
    } else {
        strengthBar.style.width = strength.width + '%';
        strengthBar.style.backgroundColor = strength.color;
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) {
        return { width: 25, color: '#ef4444' };
    } else if (score === 3) {
        return { width: 50, color: '#f59e0b' };
    } else if (score === 4) {
        return { width: 75, color: '#10b981' };
    } else {
        return { width: 100, color: '#059669' };
    }
}

function showModalMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const messageP = document.createElement('p');
    messageP.textContent = message;
    messageP.className = 'text-lg text-gray-800 mb-6';
    modalContent.appendChild(messageP);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.className = 'px-6 py-2 bg-[#8b3d4f] text-white font-semibold rounded-md hover:bg-[#a24f63] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8b3d4f] focus:ring-opacity-50';
    closeButton.onclick = () => document.body.removeChild(modal);
    modalContent.appendChild(closeButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Admin Functions
async function viewAllStudents() {
    try {
        // Check authentication first
        if (!checkAuthStatus()) {
            showModalMessage('Please log in to view students');
            return;
        }
        
        const response = await apiRequest('/admin/users?role=student');
        showUsersList(response.users, 'All Students');
    } catch (error) {
        console.error('Error loading students:', error);
        if (error.message.includes('Invalid or inactive user')) {
            showModalMessage('Your session has expired. Please log in again.');
            logout();
        } else {
            showModalMessage('Error loading students: ' + error.message);
        }
    }
}

async function viewAllFaculty() {
    try {
        // Check authentication first
        if (!checkAuthStatus()) {
            showModalMessage('Please log in to view faculty');
            return;
        }
        
        const response = await apiRequest('/admin/users?role=faculty');
        showUsersList(response.users, 'All Faculty');
    } catch (error) {
        console.error('Error loading faculty:', error);
        if (error.message.includes('Invalid or inactive user')) {
            showModalMessage('Your session has expired. Please log in again.');
            logout();
        } else {
            showModalMessage('Error loading faculty: ' + error.message);
        }
    }
}

function showUsersList(users, title) {
    const modal = document.getElementById('usersListModal');
    const titleElement = document.getElementById('usersListTitle');
    const tbody = document.getElementById('usersTableBody');
    
    titleElement.textContent = title;
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${user.firstName} ${user.lastName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${user.email}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'faculty' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }">
                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${user.phone || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="editUser('${user._id}')" class="text-indigo-600 hover:text-indigo-900 transition-colors duration-200" title="Edit User">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteUser('${user._id}', '${user.firstName} ${user.lastName}')" class="text-red-600 hover:text-red-900 transition-colors duration-200" title="Delete User">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    modal.classList.remove('hidden');
}

function showAddUserModal() {
    const modal = document.getElementById('addUserModal');
    modal.classList.remove('hidden');
    
    // Clear form
    document.getElementById('addUserForm').reset();
    
    // Hide role-specific fields initially
    document.getElementById('studentFields').classList.add('hidden');
    document.getElementById('facultyFields').classList.add('hidden');
    
    // Add event listener for role change
    const roleSelect = document.getElementById('userRole');
    roleSelect.addEventListener('change', toggleRoleFields);
}

function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    modal.classList.add('hidden');
    
    // Remove event listener
    const roleSelect = document.getElementById('userRole');
    roleSelect.removeEventListener('change', toggleRoleFields);
}

function toggleRoleFields() {
    const role = document.getElementById('userRole').value;
    const studentFields = document.getElementById('studentFields');
    const facultyFields = document.getElementById('facultyFields');
    const emailInput = document.getElementById('email');
    
    // Hide all role-specific fields first
    studentFields.classList.add('hidden');
    facultyFields.classList.add('hidden');
    
    // Show relevant fields based on role
    if (role === 'student') {
        studentFields.classList.remove('hidden');
    } else if (role === 'faculty') {
        facultyFields.classList.remove('hidden');
    }
    
    // Update email validation
    showEmailValidation(emailInput, role);
}

function closeUsersListModal() {
    const modal = document.getElementById('usersListModal');
    modal.classList.add('hidden');
}

async function handleAddUser(event) {
    event.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        role: document.getElementById('userRole').value,
        phone: document.getElementById('phone').value.trim()
    };
    
    // Add role-specific fields
    const role = formData.role;
    if (role === 'student') {
        formData.studentId = document.getElementById('studentId').value.trim();
        formData.course = document.getElementById('course').value.trim();
        formData.semester = document.getElementById('semester').value;
    } else if (role === 'faculty') {
        formData.employeeId = document.getElementById('employeeId').value.trim();
        formData.department = document.getElementById('department').value.trim();
        formData.designation = document.getElementById('designation').value.trim();
    }
    
    // Validate form
    if (!formData.username || !formData.email || !formData.password || 
        !formData.firstName || !formData.lastName || !formData.role) {
        showModalMessage('Please fill in all required fields.');
        return;
    }
    
    if (formData.password.length < 6) {
        showModalMessage('Password must be at least 6 characters long.');
        return;
    }
    
    try {
        const response = await apiRequest('/admin/users', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showModalMessage('User created successfully!');
        closeAddUserModal();
        
        // Refresh the current view if we're viewing users
        const usersModal = document.getElementById('usersListModal');
        if (!usersModal.classList.contains('hidden')) {
            const title = document.getElementById('usersListTitle').textContent;
            if (title.includes('Students')) {
                viewAllStudents();
            } else if (title.includes('Faculty')) {
                viewAllFaculty();
            }
        }
        
    } catch (error) {
        showModalMessage('Error creating user: ' + error.message);
    }
}

async function editUser(userId) {
    try {
        // Check authentication first
        if (!checkAuthStatus()) {
            showModalMessage('Please log in to edit users');
            return;
        }
        
        // Fetch user details
        const response = await apiRequest(`/admin/users/${userId}`);
        
        if (response.success) {
            showEditUserModal(response.user);
        } else {
            showModalMessage('Error loading user details: ' + response.message);
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showModalMessage('Error loading user details: ' + error.message);
    }
}

function showEditUserModal(user) {
    const modal = document.getElementById('editUserModal');
    
    // Close users list modal if it's open
    const usersListModal = document.getElementById('usersListModal');
    if (!usersListModal.classList.contains('hidden')) {
        usersListModal.classList.add('hidden');
    }
    
    // Populate form fields
    document.getElementById('editUserId').value = user._id;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editIsActive').checked = user.isActive;
    
    // Show/hide role-specific fields
    toggleEditRoleFields(user.role);
    
    // Add event listener for role change
    const roleSelect = document.getElementById('editUserRole');
    roleSelect.addEventListener('change', () => toggleEditRoleFields(roleSelect.value));
    
    modal.classList.remove('hidden');
}

function toggleEditRoleFields(role) {
    const studentFields = document.getElementById('editStudentFields');
    const facultyFields = document.getElementById('editFacultyFields');
    const emailInput = document.getElementById('editEmail');
    
    // Hide all role-specific fields first
    studentFields.classList.add('hidden');
    facultyFields.classList.add('hidden');
    
    // Show relevant fields based on role
    if (role === 'student') {
        studentFields.classList.remove('hidden');
    } else if (role === 'faculty') {
        facultyFields.classList.remove('hidden');
    }
    
    // Update email validation
    showEmailValidation(emailInput, role);
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    modal.classList.add('hidden');
    
    // Remove event listener
    const roleSelect = document.getElementById('editUserRole');
    roleSelect.removeEventListener('change', toggleEditRoleFields);
    
    // Reset form
    document.getElementById('editUserForm').reset();
    
    // Reopen users list modal
    const title = document.getElementById('usersListTitle').textContent;
    if (title.includes('Students')) {
        viewAllStudents();
    } else if (title.includes('Faculty')) {
        viewAllFaculty();
    }
}

async function handleEditUser(event) {
    event.preventDefault();
    
    const formData = {
        firstName: document.getElementById('editFirstName').value.trim(),
        lastName: document.getElementById('editLastName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        role: document.getElementById('editUserRole').value,
        isActive: document.getElementById('editIsActive').checked
    };
    
    // Add role-specific fields
    const role = formData.role;
    if (role === 'student') {
        formData.studentId = document.getElementById('editStudentId').value.trim();
        formData.course = document.getElementById('editCourse').value.trim();
        formData.semester = document.getElementById('editSemester').value;
    } else if (role === 'faculty') {
        formData.employeeId = document.getElementById('editEmployeeId').value.trim();
        formData.department = document.getElementById('editDepartment').value.trim();
        formData.designation = document.getElementById('editDesignation').value.trim();
    }
    
    const userId = document.getElementById('editUserId').value;
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Updating...';
    submitButton.disabled = true;
    
    try {
        const response = await apiRequest(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        if (response.success) {
            showModalMessage('User updated successfully!');
            closeEditUserModal();
            
            // Refresh the current view if we're viewing users
            const usersModal = document.getElementById('usersListModal');
            if (!usersModal.classList.contains('hidden')) {
                const title = document.getElementById('usersListTitle').textContent;
                if (title.includes('Students')) {
                    viewAllStudents();
                } else if (title.includes('Faculty')) {
                    viewAllFaculty();
                }
            }
        } else {
            showModalMessage('Error updating user: ' + response.message);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showModalMessage('Error updating user: ' + error.message);
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await apiRequest(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        showModalMessage('User deleted successfully!');
        
        // Refresh the current view
        const title = document.getElementById('usersListTitle').textContent;
        if (title.includes('Students')) {
            viewAllStudents();
        } else if (title.includes('Faculty')) {
            viewAllFaculty();
        }
        
    } catch (error) {
        showModalMessage('Error deleting user: ' + error.message);
    }
}

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || !userType) {
        console.log('No authentication found, redirecting to login');
        showLoginPage();
        return false;
    }
    
    // Check if token is expired by trying to decode it
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
            console.log('Stored token is expired, logging out');
            handleTokenExpiration();
            return false;
        }
    } catch (error) {
        console.log('Invalid token format, logging out');
        handleTokenExpiration();
        return false;
    }
    
    // Set global variables
    authToken = token;
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    console.log('Authentication found:', {
        hasToken: !!token,
        userType: userType,
        hasUser: !!currentUser
    });
    
    return true;
}

// Email validation functions
function validateStudentEmail(email) {
    const pattern = /^[0-9]{13}@silveroakuni\.ac\.in$/;
    return pattern.test(email);
}

function validateFacultyEmail(email) {
    const pattern = /^[0-9]{5,7}@silveroakuni\.ac\.in$/;
    return pattern.test(email);
}

function validateAdminEmail(email) {
    const pattern = /^admin[a-z]*@silveroakuni\.ac\.in$/;
    return pattern.test(email);
}

function validateEmailByRole(email, role) {
    switch (role) {
        case 'student':
            return validateStudentEmail(email);
        case 'faculty':
            return validateFacultyEmail(email);
        case 'admin':
            return validateAdminEmail(email);
        default:
            return false;
    }
}

function getEmailValidationMessage(role) {
    switch (role) {
        case 'student':
            return 'Must be a 13-digit number followed by @silveroakuni.ac.in (e.g., 1234567890123@silveroakuni.ac.in)';
        case 'faculty':
            return 'Must be a 5-7 digit number followed by @silveroakuni.ac.in (e.g., 12345@silveroakuni.ac.in)';
        case 'admin':
            return 'Must start with "admin" followed by @silveroakuni.ac.in (e.g., admin@silveroakuni.ac.in)';
        default:
            return 'Please select a user type first';
    }
}

function showEmailValidation(emailInput, role) {
    const email = emailInput.value.trim();
    const isValid = validateEmailByRole(email, role);
    const message = getEmailValidationMessage(role);
    
    // Remove existing validation elements
    const existingError = emailInput.parentNode.querySelector('.email-validation-error');
    const existingHelp = emailInput.parentNode.querySelector('.email-validation-help');
    
    if (existingError) existingError.remove();
    if (existingHelp) existingHelp.remove();
    
    if (email && role) {
        if (isValid) {
            emailInput.classList.remove('border-red-500');
            emailInput.classList.add('border-green-500');
        } else {
            emailInput.classList.remove('border-green-500');
            emailInput.classList.add('border-red-500');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'email-validation-error text-red-500 text-xs mt-1';
            errorDiv.textContent = message;
            emailInput.parentNode.appendChild(errorDiv);
        }
        
        // Add help text
        const helpDiv = document.createElement('div');
        helpDiv.className = 'email-validation-help text-gray-500 text-xs mt-1';
        helpDiv.textContent = message;
        emailInput.parentNode.appendChild(helpDiv);
    } else {
        emailInput.classList.remove('border-red-500', 'border-green-500');
    }
}

// Statistics Functions
async function loadStatistics() {
    try {
        const response = await apiRequest('/admin/statistics', {
            method: 'GET'
        });
        
        if (response.success) {
            updateStatisticsDisplay(response.statistics);
        } else {
            console.error('Failed to load statistics:', response.message);
            showStatisticsError();
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showStatisticsError();
    }
}

function updateStatisticsDisplay(stats) {
    // Update the statistics display elements
    const elements = {
        totalStudents: stats.totalStudents,
        totalFaculty: stats.totalFaculty,
        activeCourses: stats.activeCourses,
        totalUsers: stats.totalUsers,
        totalComplaints: stats.totalComplaints,
        recentStudents: stats.recentStudents
    };
    
    // Update each element
    Object.keys(elements).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = elements[key].toLocaleString();
        }
    });
}

function showStatisticsError() {
    // Show error state for statistics
    const elements = ['totalStudents', 'totalFaculty', 'activeCourses', 'totalUsers', 'totalComplaints', 'recentStudents'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Error';
            element.className = 'font-medium text-red-500';
        }
    });
}

function refreshStatistics() {
    // Reset to loading state
    const elements = ['totalStudents', 'totalFaculty', 'activeCourses', 'totalUsers', 'totalComplaints', 'recentStudents'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Loading...';
            element.className = 'font-medium';
        }
    });
    
    // Reload statistics
    loadStatistics();
}
