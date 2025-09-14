/*
 * College Management System - Frontend JavaScript
 * Integrates with Node.js backend APIs
 */

// Global variables
let currentUser = null;
let authToken = null;
const API_BASE_URL = 'http://localhost:3000/api';

// ---- Form Validation Helpers ----
function setFieldError(input, message) {
    if (!input) return;
    input.classList.add('border-red-500');
    input.classList.remove('border-green-500');
    let error = input.parentNode.querySelector('.field-error');
    if (!error) {
        error = document.createElement('div');
        error.className = 'field-error text-red-500 text-xs mt-1';
        input.parentNode.appendChild(error);
    }
    error.textContent = message;
}

function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('border-red-500');
    let error = input.parentNode.querySelector('.field-error');
    if (error) error.remove();
}

function validateAddUserForm(form, showErrors = false) {
    let valid = true;
    const role = form.querySelector('#userRole').value;

    const requiredIds = ['firstName', 'lastName', 'email', 'username', 'password'];
    requiredIds.forEach(id => {
        const el = form.querySelector(`#${id}`);
        if (el) {
            const value = el.value.trim();
            if (!value) {
                valid = false;
                if (showErrors) setFieldError(el, 'This field is required'); else clearFieldError(el);
            } else {
                clearFieldError(el);
            }
        }
    });

    // Password length
    const passwordEl = form.querySelector('#password');
    if (passwordEl && passwordEl.value.length > 0 && passwordEl.value.length < 6) {
        valid = false;
        if (showErrors) setFieldError(passwordEl, 'Password must be at least 6 characters'); else clearFieldError(passwordEl);
    }

    // Email format per role
    const emailEl = form.querySelector('#email');
    const email = emailEl.value.trim();
    if (email && role) {
        if (!validateEmailByRole(email, role)) {
            valid = false;
            if (showErrors) setFieldError(emailEl, getEmailValidationMessage(role)); else clearFieldError(emailEl);
        } else {
            clearFieldError(emailEl);
        }
    }

    // Role-specific requireds
    if (!role) valid = false;
    if (role === 'student') {
        const sid = form.querySelector('#studentId');
        const course = form.querySelector('#course');
        const sem = form.querySelector('#semester');
        if (!sid || !sid.value.trim()) { valid = false; if (showErrors && sid) setFieldError(sid, 'Student ID is required'); else if (sid) clearFieldError(sid); }
        if (!course || !course.value.trim()) { valid = false; if (showErrors && course) setFieldError(course, 'Course is required'); else if (course) clearFieldError(course); }
        if (!sem || !sem.value) { valid = false; if (showErrors && sem) setFieldError(sem, 'Semester is required'); else if (sem) clearFieldError(sem); }
        if (sem && sem.value && (Number(sem.value) < 1 || Number(sem.value) > 8)) { valid = false; if (showErrors) setFieldError(sem, 'Semester must be 1-8'); }
    } else if (role === 'faculty') {
        const emp = form.querySelector('#employeeId');
        const dept = form.querySelector('#department');
        const desig = form.querySelector('#designation');
        if (!emp || !emp.value.trim()) { valid = false; if (showErrors && emp) setFieldError(emp, 'Employee ID is required'); else if (emp) clearFieldError(emp); }
        if (!dept || !dept.value.trim()) { valid = false; if (showErrors && dept) setFieldError(dept, 'Department is required'); else if (dept) clearFieldError(dept); }
        if (!desig || !desig.value.trim()) { valid = false; if (showErrors && desig) setFieldError(desig, 'Designation is required'); else if (desig) clearFieldError(desig); }
    }

    return valid;
}

function updateAddUserSubmitState(form) {
    const btn = document.querySelector('button[form="addUserForm"]');
    if (!btn) return;
    const valid = validateAddUserForm(form, false);
    btn.disabled = !valid;
    if (btn.disabled) {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function validateEditUserForm(form, showErrors = false) {
    let valid = true;
    const role = form.querySelector('#editUserRole').value;
    const requiredIds = ['editFirstName', 'editLastName', 'editEmail'];
    requiredIds.forEach(id => {
        const el = form.querySelector(`#${id}`);
        if (el) {
            const value = el.value.trim();
            if (!value) {
                valid = false;
                if (showErrors) setFieldError(el, 'This field is required'); else clearFieldError(el);
            } else {
                clearFieldError(el);
            }
        }
    });

    // Email format per role
    const emailEl = form.querySelector('#editEmail');
    const email = emailEl.value.trim();
    if (email && role) {
        if (!validateEmailByRole(email, role)) {
            valid = false;
            if (showErrors) setFieldError(emailEl, getEmailValidationMessage(role)); else clearFieldError(emailEl);
        } else {
            clearFieldError(emailEl);
        }
    }

    // Role specific
    if (!role) valid = false;
    if (role === 'student') {
        const sid = form.querySelector('#editStudentId');
        const course = form.querySelector('#editCourse');
        const sem = form.querySelector('#editSemester');
        if (!sid || !sid.value.trim()) { valid = false; if (showErrors && sid) setFieldError(sid, 'Student ID is required'); else if (sid) clearFieldError(sid); }
        if (!course || !course.value.trim()) { valid = false; if (showErrors && course) setFieldError(course, 'Course is required'); else if (course) clearFieldError(course); }
        if (!sem || !sem.value) { valid = false; if (showErrors && sem) setFieldError(sem, 'Semester is required'); else if (sem) clearFieldError(sem); }
        if (sem && sem.value && (Number(sem.value) < 1 || Number(sem.value) > 8)) { valid = false; if (showErrors) setFieldError(sem, 'Semester must be 1-8'); }
    } else if (role === 'faculty') {
        const emp = form.querySelector('#editEmployeeId');
        const dept = form.querySelector('#editDepartment');
        const desig = form.querySelector('#editDesignation');
        if (!emp || !emp.value.trim()) { valid = false; if (showErrors && emp) setFieldError(emp, 'Employee ID is required'); else if (emp) clearFieldError(emp); }
        if (!dept || !dept.value.trim()) { valid = false; if (showErrors && dept) setFieldError(dept, 'Department is required'); else if (dept) clearFieldError(dept); }
        if (!desig || !desig.value.trim()) { valid = false; if (showErrors && desig) setFieldError(desig, 'Designation is required'); else if (desig) clearFieldError(desig); }
    }

    return valid;
}

function updateEditUserSubmitState(form) {
    const btn = document.querySelector('button[form="editUserForm"]');
    if (!btn) return;
    const valid = validateEditUserForm(form, false);
    btn.disabled = !valid;
    if (btn.disabled) {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

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
        // Ensure forms on dashboards are bound as well (e.g., Add/Edit User)
        initializeForms();

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

// Helper functions for forgot password
function clearForgotPasswordErrors() {
    const errorElements = ['forgot-email-error', 'forgot-password-error'];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Clear success message
    const successElement = document.getElementById('forgot-password-success');
    if (successElement) {
        successElement.classList.add('hidden');
    }
}

function clearResetPasswordErrors() {
    const errorElements = ['new-password-error', 'confirm-password-error', 'reset-password-error'];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Clear success message
    const successElement = document.getElementById('reset-password-success');
    if (successElement) {
        successElement.classList.add('hidden');
    }
}

function showForgotPasswordError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function showForgotPasswordSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    }
}

function showResetPasswordError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function showResetPasswordSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    return password.length >= 8 &&
           /[a-z]/.test(password) &&
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
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
    if (!emailInput || !role) return;
    
    const email = emailInput.value.trim();
    
    // Clear previous validation state
    clearFieldError(emailInput);
    
    if (email === '') {
        // Don't show error for empty field, just clear any existing error
        return;
    }
    
    // Validate email based on role
    const isValid = validateEmailByRole(email, role);
    
    if (!isValid) {
        const message = getEmailValidationMessage(role);
        setFieldError(emailInput, message);
    }
}

// Handle forgot password form submission
function handleForgotPassword(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearForgotPasswordErrors();
    
    // Get form data
    const email = document.getElementById('forgot-email').value.trim();
    const userType = document.querySelector('input[name="forgot-user-type"]:checked').value;
    
    // Validate email
    let isValid = true;
    
    if (!email) {
        showForgotPasswordError('forgot-email-error', 'Email address is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showForgotPasswordError('forgot-email-error', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Simulate sending reset email
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // In a real application, this would send an email with a reset link
        console.log(`Password reset requested for ${userType}: ${email}`);
        
        // Show success message
        showForgotPasswordSuccess('forgot-password-success', 
            'Password reset link has been sent to your email address. Please check your inbox and spam folder.');
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Clear form
        document.getElementById('forgot-email').value = '';
        
    }, 2000);
}

// Handle reset password form submission
function handleResetPassword(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearResetPasswordErrors();
    
    // Get form data
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords
    let isValid = true;
    
    if (!newPassword) {
        showResetPasswordError('new-password-error', 'New password is required');
        isValid = false;
    } else if (!isValidPassword(newPassword)) {
        showResetPasswordError('new-password-error', 'Password must meet all requirements');
        isValid = false;
    }
    
    if (!confirmPassword) {
        showResetPasswordError('confirm-password-error', 'Please confirm your password');
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        showResetPasswordError('confirm-password-error', 'Passwords do not match');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Simulate password update
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Updating...';
    submitButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        console.log('Password updated successfully');
        
        // Show success message
        showResetPasswordSuccess('reset-password-success', 
            'Your password has been updated successfully! You can now log in with your new password.');
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Clear form
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
            showLoginPage();
        }, 3000);
        
    }, 2000);
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
        addUserForm.addEventListener('input', () => updateAddUserSubmitState(addUserForm));
        addUserForm.addEventListener('change', () => updateAddUserSubmitState(addUserForm));
        // Initial state
        updateAddUserSubmitState(addUserForm);
    }
    
    // Edit user form
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', handleEditUser);
        editUserForm.addEventListener('input', () => updateEditUserSubmitState(editUserForm));
        editUserForm.addEventListener('change', () => updateEditUserSubmitState(editUserForm));
        // Initial state
        updateEditUserSubmitState(editUserForm);
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
    
    // Get token from either storage location
    let token = authToken;
    if (!token) {
        token = localStorage.getItem('authToken') || localStorage.getItem('token');
    }
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };
    
    // Ensure Authorization header is properly set
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log('API Request:', url);
    console.log('Auth Token:', token ? 'Present' : 'Missing');
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'None');
    console.log('Full Authorization header:', config.headers.Authorization);
    console.log('Request config:', config);
    
    // Decode JWT token to check if it's valid
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('JWT Payload:', payload);
            console.log('Token expires at:', new Date(payload.exp * 1000));
            console.log('Token is expired:', payload.exp < Math.floor(Date.now() / 1000));
        } catch (e) {
            console.error('Error decoding JWT:', e);
        }
    }
    
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
            body: JSON.stringify({ username, password })
        });
        
        // Store authentication data
        authToken = response.token;
        currentUser = response.user;
        
        // Determine user type (role) from server response
        const resolvedUserType = response.user?.role;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userType', resolvedUserType);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Restore button state so it looks correct after logout returns to login
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        // Show dashboard by role returned from backend
        showDashboard(resolvedUserType);
        
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
        
        // Immediately update welcome message with stored user data
        updateWelcomeMessageImmediately(userType);
        
        loadDashboardData(userType);
    }
}

// Immediately update welcome message with stored user data
function updateWelcomeMessageImmediately(userType) {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (storedUser && storedUser.firstName) {
        const dashboardId = `${userType}-dashboard`;
        const welcomeElement = document.querySelector(`#${dashboardId} h2`);
        if (welcomeElement) {
            if (userType === 'admin') {
                welcomeElement.textContent = `Welcome, Admin`;
            } else {
                welcomeElement.textContent = `Welcome, ${storedUser.firstName} ${storedUser.lastName || ''}`.trim();
            }
        }
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

        // Load announcements for student
        try {
            const annResponse = await apiRequest('/student/announcements');
            updateStudentAnnouncements(annResponse.announcements);
        } catch (error) {
            console.error('Error loading student announcements:', error);
        }

        // Load exams schedule
        try {
            const examsResponse = await apiRequest('/student/exams');
            updateStudentExams(examsResponse.exams);
        } catch (error) {
            console.error('Error loading student exams:', error);
        }
        
    } catch (error) {
        console.error('Error loading student dashboard:', error);
    }
}

function updateStudentAnnouncements(announcements) {
    const container = document.getElementById('student-announcements-list');
    if (container) {
        container.innerHTML = '';
        if (announcements && announcements.length) {
            announcements.forEach(a => {
                const li = document.createElement('li');
                li.className = 'bg-gray-50 border-l-4 border-[#8b3d4f] p-3 rounded-md';
                li.innerHTML = `
                    <p class="text-sm font-semibold text-gray-800">${a.title}</p>
                    <p class="text-xs text-gray-500">${new Date(a.publishDate).toLocaleString()} • ${a.author?.name || ''}</p>
                    <p class="text-sm text-gray-700 mt-1">${a.content}</p>
                `;
                container.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'text-sm text-gray-500';
            li.textContent = 'No announcements';
            container.appendChild(li);
        }
    }
}

function updateStudentExams(exams) {
    const examsTableBody = document.getElementById('student-exams-tbody');
    if (examsTableBody && exams) {
        examsTableBody.innerHTML = '';
        exams.forEach(exam => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${exam.subjectName}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${new Date(exam.examDate).toLocaleDateString()}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${exam.examTime}</td>
            `;
            examsTableBody.appendChild(tr);
        });
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
        // Update welcome header as well
        const welcomeElement = document.querySelector('#student-dashboard h2');
        if (welcomeElement) {
            if (student && student.userId) {
                welcomeElement.textContent = `Welcome, ${student.userId.firstName}`;
            } else {
                // Fallback to stored user data from localStorage
                const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                if (storedUser && storedUser.firstName) {
                    welcomeElement.textContent = `Welcome, ${storedUser.firstName}`;
                } else {
                    // Final fallback - just show Welcome
                    welcomeElement.textContent = 'Welcome';
                }
            }
        }
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
        updateFacultyCourses(profileResponse.faculty?.subjects || []);
        
        // Load complaints
        const complaintsResponse = await apiRequest('/faculty/complaints');
        updateFacultyComplaints(complaintsResponse.complaints);
        
        // Load admin announcements for faculty view
        try {
            const annResponse = await apiRequest('/faculty/announcements/feed');
            updateFacultyAnnouncements(annResponse.announcements);
        } catch (error) {
            console.error('Error loading faculty announcements feed:', error);
        }
        
    } catch (error) {
        console.error('Error loading faculty dashboard:', error);
    }
}

function updateFacultyProfile(faculty) {
    const welcomeElement = document.querySelector('#faculty-dashboard h2');
    if (welcomeElement) {
        if (faculty && faculty.userId) {
            // Use faculty data from API
            welcomeElement.textContent = `Welcome, ${faculty.userId.firstName} ${faculty.userId.lastName}`;
        } else {
            // Fallback to stored user data from localStorage
            const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (storedUser && storedUser.firstName) {
                welcomeElement.textContent = `Welcome, ${storedUser.firstName} ${storedUser.lastName || ''}`.trim();
            } else {
                // Final fallback - just show Welcome
                welcomeElement.textContent = 'Welcome';
            }
        }
    }
}

function updateFacultyCourses(subjects) {
    // Update the course list and selects on the faculty dashboard
    const courseList = document.querySelector('#faculty-dashboard ul.list-disc');
    if (courseList) {
        courseList.innerHTML = '';
        if (subjects.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No subjects assigned';
            courseList.appendChild(li);
        } else {
            subjects.forEach(s => {
                const li = document.createElement('li');
                li.textContent = `${s.subjectName} (${s.subjectCode})`;
                courseList.appendChild(li);
            });
        }
    }
    // Populate selects
    const selects = document.querySelectorAll('#faculty-dashboard select');
    selects.forEach(sel => {
        const current = sel.value;
        sel.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select a course';
        sel.appendChild(placeholder);
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.subjectCode;
            opt.textContent = `${s.subjectName}`;
            sel.appendChild(opt);
        });
        sel.value = current;
    });
}

function updateFacultyAnnouncements(announcements) {
    const container = document.getElementById('faculty-admin-announcements');
    if (container) {
        container.innerHTML = '';
        if (announcements && announcements.length) {
            announcements.forEach(a => {
                const li = document.createElement('li');
                li.className = 'bg-gray-50 border-l-4 border-[#8b3d4f] p-3 rounded-md';
                li.innerHTML = `
                    <p class="text-sm font-semibold text-gray-800">${a.title}</p>
                    <p class="text-xs text-gray-500">${new Date(a.publishDate).toLocaleString()} • ${a.author?.name || ''}</p>
                    <p class="text-sm text-gray-700 mt-1">${a.content}</p>
                `;
                container.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'text-sm text-gray-500';
            li.textContent = 'No announcements';
            container.appendChild(li);
        }
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

// Grade Management Functions
async function viewGrades() {
    try {
        const selectedCourse = document.querySelector('#faculty-dashboard select').value;
        if (!selectedCourse) {
            showModalMessage("Please select a course first.");
            return;
        }

        const response = await apiRequest(`/faculty/grades/subject/${selectedCourse}`);
        if (response.success) {
            showGradesModal(response.grades, selectedCourse);
        } else {
            showModalMessage("Error loading grades: " + response.message);
        }
    } catch (error) {
        showModalMessage("Error loading grades: " + error.message);
    }
}

function showGradesModal(grades, subjectCode) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Grades for ${subjectCode}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${grades.map(grade => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${grade.studentId?.userId?.firstName} ${grade.studentId?.userId?.lastName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.enrollmentNumber}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.examType}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.marks.obtained}/${grade.marks.total}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                                        grade.grade === 'B+' || grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                        grade.grade === 'C+' || grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                        grade.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }">
                                        ${grade.grade}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <button onclick="editGrade('${grade._id}')" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onclick="deleteGrade('${grade._id}', '${grade.studentId?.userId?.firstName} ${grade.studentId?.userId?.lastName}')" class="text-red-600 hover:text-red-900">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function editGrade(gradeId) {
    try {
        const response = await apiRequest(`/faculty/grades/${gradeId}`);
        if (response.success) {
            showEditGradeModal(response.grade);
        } else {
            showModalMessage('Error loading grade: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error loading grade: ' + error.message);
    }
}

function showEditGradeModal(grade) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Edit Grade</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="editGradeForm">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Student</label>
                        <input type="text" value="${grade.studentId?.userId?.firstName} ${grade.studentId?.userId?.lastName}" disabled class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Subject</label>
                        <input type="text" value="${grade.subjectName}" disabled class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Exam Type</label>
                        <input type="text" value="${grade.examType}" disabled class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Obtained Marks</label>
                            <input type="number" id="edit-grade-marks" value="${grade.marks.obtained}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Total Marks</label>
                            <input type="number" id="edit-grade-total-marks" value="${grade.marks.total}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Exam Date</label>
                        <input type="date" id="edit-grade-exam-date" value="${new Date(grade.examDate).toISOString().split('T')[0]}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <select id="edit-grade-status" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                            <option value="published" ${grade.status === 'published' ? 'selected' : ''}>Published</option>
                            <option value="draft" ${grade.status === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="under_review" ${grade.status === 'under_review' ? 'selected' : ''}>Under Review</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea id="edit-grade-remarks" rows="2" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">${grade.remarks || ''}</textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-[#8b3d4f] text-white rounded-md hover:bg-[#a24f63]">Update Grade</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Add form submission handler
    document.getElementById('editGradeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateGrade(grade._id);
    });
}

async function updateGrade(gradeId) {
    try {
        const marks = document.getElementById('edit-grade-marks').value;
        const totalMarks = document.getElementById('edit-grade-total-marks').value;
        const examDate = document.getElementById('edit-grade-exam-date').value;
        const status = document.getElementById('edit-grade-status').value;
        const remarks = document.getElementById('edit-grade-remarks').value.trim();

        const response = await apiRequest(`/faculty/grades/${gradeId}`, {
            method: 'PUT',
            body: JSON.stringify({
                marks: parseInt(marks),
                totalMarks: parseInt(totalMarks),
                examDate,
                status,
                remarks
            })
        });

        if (response.success) {
            showModalMessage('Grade updated successfully!');
            document.querySelector('.fixed').remove();
        } else {
            showModalMessage('Error updating grade: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error updating grade: ' + error.message);
    }
}

async function deleteGrade(gradeId, studentName) {
    if (!confirm(`Are you sure you want to delete the grade for ${studentName}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await apiRequest(`/faculty/grades/${gradeId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showModalMessage('Grade deleted successfully!');
            // Refresh grades list
            viewGrades();
        } else {
            showModalMessage('Error deleting grade: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error deleting grade: ' + error.message);
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
function openCreateAssignmentModal() {
    const modal = document.getElementById('createAssignmentModal');
    modal.classList.remove('hidden');
    modal.classList.add('page-transition');
}

function closeCreateAssignmentModal() {
    const modal = document.getElementById('createAssignmentModal');
    modal.classList.add('hidden');
    modal.classList.remove('page-transition');
}

function openViewGradesModal() {
    const modal = document.getElementById('viewGradesModal');
    modal.classList.remove('hidden');
    modal.classList.add('page-transition');
    // Load grades when modal opens
    loadGradesForSubject();
    
    // Add event listener for subject change
    const subjectSelect = document.getElementById('grades-subject');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', loadGradesForSubject);
    }
}

function closeViewGradesModal() {
    const modal = document.getElementById('viewGradesModal');
    modal.classList.add('hidden');
    modal.classList.remove('page-transition');
}

function openMarkAttendanceModal() {
    const modal = document.getElementById('markAttendanceModal');
    modal.classList.remove('hidden');
    modal.classList.add('page-transition');
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    // Load students when modal opens
    loadStudentsForAttendance();
    
    // Add event listener for subject change
    const subjectSelect = document.getElementById('attendance-subject');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', loadStudentsForAttendance);
    }
}

function closeMarkAttendanceModal() {
    const modal = document.getElementById('markAttendanceModal');
    modal.classList.add('hidden');
    modal.classList.remove('page-transition');
}

async function loadGradesForSubject() {
    try {
        const subjectCode = document.getElementById('grades-subject').value;
        
        if (!subjectCode) {
            document.getElementById('grades-content').innerHTML = '<p class="text-gray-500">Please select a subject to view grades.</p>';
            return;
        }

        const response = await apiRequest(`/faculty/grades/subject/${subjectCode}`, {
            method: 'GET'
        });

        if (response.success && response.grades) {
            const grades = response.grades;
            let html = '<div class="space-y-3">';
            
            grades.forEach(grade => {
                html += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <span class="font-medium">${grade.studentId.userId.firstName} ${grade.studentId.userId.lastName}</span>
                            <span class="text-gray-500 ml-2">(${grade.studentId.enrollmentNumber})</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <input type="number" id="grade-${grade.studentId._id}" value="${grade.marks.obtained || ''}" min="0" max="100" class="w-20 px-2 py-1 border border-gray-300 rounded text-sm">
                            <button onclick="updateGrade('${grade.studentId._id}', '${subjectCode}')" class="px-3 py-1 bg-[#8b3d4f] text-white text-sm rounded hover:bg-[#a24f63]">Update</button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            document.getElementById('grades-content').innerHTML = html;
        } else {
            document.getElementById('grades-content').innerHTML = '<p class="text-gray-500">No grades found for this subject.</p>';
        }
    } catch (error) {
        console.error('Error loading grades:', error);
        document.getElementById('grades-content').innerHTML = '<p class="text-red-500">Error loading grades.</p>';
    }
}

async function loadStudentsForAttendance() {
    try {
        const subjectCode = document.getElementById('attendance-subject').value;
        
        if (!subjectCode) {
            document.getElementById('students-list').innerHTML = '<p class="text-gray-500">Please select a subject first.</p>';
            return;
        }

        const response = await apiRequest(`/faculty/students/subject/${subjectCode}`, {
            method: 'GET'
        });

        if (response.success && response.students) {
            const students = response.students;
            let html = '<div class="space-y-2">';
            
            students.forEach(student => {
                html += `
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">${student.userId.firstName} ${student.userId.lastName}</span>
                            <span class="text-gray-500 ml-2">(${student.enrollmentNumber})</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <label class="flex items-center">
                                <input type="radio" name="attendance-${student._id}" value="present" checked class="mr-1">
                                <span class="text-sm">Present</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="attendance-${student._id}" value="absent" class="mr-1">
                                <span class="text-sm">Absent</span>
                            </label>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            document.getElementById('students-list').innerHTML = html;
        } else {
            document.getElementById('students-list').innerHTML = '<p class="text-gray-500">No students found for this subject.</p>';
        }
    } catch (error) {
        console.error('Error loading students:', error);
        document.getElementById('students-list').innerHTML = '<p class="text-red-500">Error loading students.</p>';
    }
}

async function createNewAssignment() {
    try {
        const title = document.getElementById('assignment-title')?.value?.trim();
        const description = document.getElementById('assignment-description')?.value?.trim();
        const subjectCode = document.getElementById('assignment-subject')?.value;
        const dueDate = document.getElementById('assignment-due-date')?.value;
        const maxMarks = document.getElementById('assignment-max-marks')?.value;
        const instructions = document.getElementById('assignment-instructions')?.value?.trim();

        if (!title || !description || !subjectCode || !dueDate || !maxMarks) {
            showModalMessage('Please fill in all required fields.');
            return;
        }

        const response = await apiRequest('/faculty/assignments', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description,
                subjectCode,
                dueDate,
                maxMarks: parseInt(maxMarks),
                instructions
            })
        });

        if (response.success) {
            showModalMessage('Assignment created successfully!');
            // Clear form
            document.getElementById('assignment-title').value = '';
            document.getElementById('assignment-description').value = '';
            document.getElementById('assignment-subject').value = '';
            document.getElementById('assignment-due-date').value = '';
            document.getElementById('assignment-max-marks').value = '';
            document.getElementById('assignment-instructions').value = '';
            // Close modal
            closeCreateAssignmentModal();
        } else {
            showModalMessage('Error creating assignment: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error creating assignment: ' + error.message);
    }
}

async function updateGrade(studentId, subjectCode) {
    try {
        const marks = document.getElementById(`grade-${studentId}`).value;
        
        if (!marks || marks < 0 || marks > 100) {
            showModalMessage('Please enter valid marks (0-100).');
            return;
        }

        const response = await apiRequest('/faculty/grades', {
            method: 'POST',
            body: JSON.stringify({
                studentId,
                subjectCode,
                examType: 'assignment',
                marks: parseInt(marks),
                totalMarks: 100,
                examDate: new Date().toISOString().split('T')[0]
            })
        });

        if (response.success) {
            showModalMessage('Grade updated successfully!');
        } else {
            showModalMessage('Error updating grade: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error updating grade: ' + error.message);
    }
}

async function submitAttendance() {
    try {
        const subjectCode = document.getElementById('attendance-subject').value;
        const date = document.getElementById('attendance-date').value;

        if (!subjectCode || !date) {
            showModalMessage('Please select subject and date.');
            return;
        }

        // Collect attendance data for all students
        const attendanceData = [];
        const studentElements = document.querySelectorAll('[name^="attendance-"]');
        
        studentElements.forEach(element => {
            if (element.type === 'radio' && element.checked) {
                const studentId = element.name.replace('attendance-', '');
                const status = element.value;
                attendanceData.push({
                    studentId,
                    subjectCode,
                    date,
                    status,
                    classTime: {
                        start: '09:00',
                        end: '10:00'
                    },
                    room: 'Classroom A'
                });
            }
        });

        if (attendanceData.length === 0) {
            showModalMessage('Please mark attendance for at least one student.');
            return;
        }

        // Submit each attendance record individually
        let successCount = 0;
        let errorCount = 0;
        
        for (const attendance of attendanceData) {
            try {
                const response = await apiRequest('/faculty/attendance', {
                    method: 'POST',
                    body: JSON.stringify(attendance)
                });
                
                if (response.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }

        if (successCount > 0) {
            showModalMessage(`Attendance marked successfully for ${successCount} students!`);
            closeMarkAttendanceModal();
        } else {
            showModalMessage('Error marking attendance for all students.');
        }
    } catch (error) {
        showModalMessage('Error marking attendance: ' + error.message);
    }
}

async function markAttendance() {
    try {
        const studentId = document.getElementById('attendance-student')?.value;
        const subjectCode = document.getElementById('attendance-subject')?.value;
        const date = document.getElementById('attendance-date')?.value;
        const status = document.getElementById('attendance-status')?.value;
        const classTimeStart = document.getElementById('class-time-start')?.value;
        const classTimeEnd = document.getElementById('class-time-end')?.value;
        const room = document.getElementById('attendance-room')?.value?.trim();
        const remarks = document.getElementById('attendance-remarks')?.value?.trim();

        if (!studentId || !subjectCode || !date || !status || !classTimeStart || !classTimeEnd || !room) {
            showModalMessage('Please fill in all required fields.');
            return;
        }

        const response = await apiRequest('/faculty/attendance', {
            method: 'POST',
            body: JSON.stringify({
                studentId,
                subjectCode,
                date,
                status,
                classTime: {
                    start: classTimeStart,
                    end: classTimeEnd
                },
                room,
                remarks
            })
        });

        if (response.success) {
            showModalMessage('Attendance marked successfully!');
            // Clear form
            document.getElementById('attendance-student').value = '';
            document.getElementById('attendance-subject').value = '';
            document.getElementById('attendance-date').value = '';
            document.getElementById('attendance-status').value = '';
            document.getElementById('class-time-start').value = '';
            document.getElementById('class-time-end').value = '';
            document.getElementById('attendance-room').value = '';
            document.getElementById('attendance-remarks').value = '';
        } else {
            showModalMessage('Error marking attendance: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error marking attendance: ' + error.message);
    }
}

// Assignment Management Functions
async function viewAssignments() {
    try {
        const response = await apiRequest('/faculty/assignments');
        if (response.success) {
            showAssignmentsModal(response.assignments);
        } else {
            showModalMessage('Error loading assignments: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error loading assignments: ' + error.message);
    }
}

function showAssignmentsModal(assignments) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">My Assignments</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${assignments.map(assignment => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assignment.title}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assignment.subjectName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(assignment.dueDate).toLocaleDateString()}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                        assignment.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }">
                                        ${assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <button onclick="editAssignment('${assignment._id}')" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onclick="deleteAssignment('${assignment._id}', '${assignment.title}')" class="text-red-600 hover:text-red-900">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function editAssignment(assignmentId) {
    try {
        const response = await apiRequest(`/faculty/assignments/${assignmentId}`);
        if (response.success) {
            showEditAssignmentModal(response.assignment);
        } else {
            showModalMessage('Error loading assignment: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error loading assignment: ' + error.message);
    }
}

function showEditAssignmentModal(assignment) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Edit Assignment</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="editAssignmentForm">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="edit-assignment-title" value="${assignment.title}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="edit-assignment-description" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">${assignment.description}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Due Date</label>
                        <input type="date" id="edit-assignment-due-date" value="${new Date(assignment.dueDate).toISOString().split('T')[0]}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Max Marks</label>
                        <input type="number" id="edit-assignment-max-marks" value="${assignment.maxMarks}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <select id="edit-assignment-status" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">
                            <option value="active" ${assignment.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="closed" ${assignment.status === 'closed' ? 'selected' : ''}>Closed</option>
                            <option value="cancelled" ${assignment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Instructions</label>
                        <textarea id="edit-assignment-instructions" rows="2" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8b3d4f] focus:border-[#8b3d4f]">${assignment.instructions || ''}</textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-[#8b3d4f] text-white rounded-md hover:bg-[#a24f63]">Update Assignment</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Add form submission handler
    document.getElementById('editAssignmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateAssignment(assignment._id);
    });
}

async function updateAssignment(assignmentId) {
    try {
        const title = document.getElementById('edit-assignment-title').value.trim();
        const description = document.getElementById('edit-assignment-description').value.trim();
        const dueDate = document.getElementById('edit-assignment-due-date').value;
        const maxMarks = document.getElementById('edit-assignment-max-marks').value;
        const status = document.getElementById('edit-assignment-status').value;
        const instructions = document.getElementById('edit-assignment-instructions').value.trim();

        const response = await apiRequest(`/faculty/assignments/${assignmentId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title,
                description,
                dueDate,
                maxMarks: parseInt(maxMarks),
                status,
                instructions
            })
        });

        if (response.success) {
            showModalMessage('Assignment updated successfully!');
            document.querySelector('.fixed').remove();
        } else {
            showModalMessage('Error updating assignment: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error updating assignment: ' + error.message);
    }
}

async function deleteAssignment(assignmentId, assignmentTitle) {
    if (!confirm(`Are you sure you want to delete "${assignmentTitle}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await apiRequest(`/faculty/assignments/${assignmentId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showModalMessage('Assignment deleted successfully!');
            // Refresh assignments list
            viewAssignments();
        } else {
            showModalMessage('Error deleting assignment: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error deleting assignment: ' + error.message);
    }
}

async function postFacultyAnnouncement() {
    try {
        // Find textarea by id
        const textarea = document.getElementById('faculty-announcement-text');
        const content = textarea ? textarea.value.trim() : '';
        if (!content) {
            showModalMessage('Please enter announcement content.');
            return;
        }
        const body = {
            title: 'Announcement',
            content,
            targetAudience: 'students'
        };
        const response = await apiRequest('/faculty/announcements', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (response.success) {
            showModalMessage('Announcement posted successfully!');
            if (textarea) textarea.value = '';
        } else {
            showModalMessage('Failed to post announcement: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        showModalMessage('Error posting announcement: ' + error.message);
    }
}

async function postAdminAnnouncement() {
    try {
        const textarea = document.getElementById('admin-announcement-text');
        const content = textarea ? textarea.value.trim() : '';
        if (!content) {
            showModalMessage('Please enter announcement content.');
            return;
        }
        const body = {
            title: 'Announcement',
            content,
            targetAudience: 'all'
        };
        const response = await apiRequest('/admin/announcements', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (response.success) {
            showModalMessage('Announcement posted successfully!');
            if (textarea) textarea.value = '';
        } else {
            showModalMessage('Failed to post announcement: ' + (response.message || 'Unknown error'));
        }
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
    // Reset login button state
    const loginForm = document.getElementById('login-form');
    const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
    if (submitButton) {
        submitButton.textContent = 'Login';
        submitButton.disabled = false;
    }
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

// Admin Assignment Management
async function viewAllAssignments() {
    try {
        const response = await apiRequest('/admin/assignments');
        if (response.success) {
            showAdminAssignmentsModal(response.assignments);
        } else {
            showModalMessage('Error loading assignments: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error loading assignments: ' + error.message);
    }
}

function showAdminAssignmentsModal(assignments) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">All Assignments</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${assignments.map(assignment => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assignment.title}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assignment.facultyId?.userId?.firstName} ${assignment.facultyId?.userId?.lastName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assignment.subjectName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(assignment.dueDate).toLocaleDateString()}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                        assignment.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }">
                                        ${assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assignment.submissions.length}/${assignment.assignedTo.length}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Admin Grade Management
async function viewAllGrades() {
    try {
        const response = await apiRequest('/admin/grades');
        if (response.success) {
            showAdminGradesModal(response.grades);
        } else {
            showModalMessage('Error loading grades: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error loading grades: ' + error.message);
    }
}

function showAdminGradesModal(grades) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">All Grades</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${grades.map(grade => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${grade.studentId?.userId?.firstName} ${grade.studentId?.userId?.lastName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.subjectName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.facultyId?.userId?.firstName} ${grade.facultyId?.userId?.lastName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.examType}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.marks.obtained}/${grade.marks.total}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                                        grade.grade === 'B+' || grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                        grade.grade === 'C+' || grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                        grade.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }">
                                        ${grade.grade}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        grade.status === 'published' ? 'bg-green-100 text-green-800' :
                                        grade.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }">
                                        ${grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Admin Attendance Management
async function viewAllAttendance() {
    try {
        const response = await apiRequest('/admin/attendance');
        if (response.success) {
            showAdminAttendanceModal(response.attendance);
        } else {
            showModalMessage('Error loading attendance: ' + response.message);
        }
    } catch (error) {
        showModalMessage('Error loading attendance: ' + error.message);
    }
}

function showAdminAttendanceModal(attendance) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">All Attendance Records</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${attendance.map(record => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${record.studentId?.userId?.firstName} ${record.studentId?.userId?.lastName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.subjectName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.facultyId?.userId?.firstName} ${record.facultyId?.userId?.lastName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(record.date).toLocaleDateString()}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                        record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }">
                                        ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.room}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
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
    // Validate inline and prevent submit if invalid
    if (!validateAddUserForm(event.target, true)) {
        updateAddUserSubmitState(event.target);
        return;
    }
    
    const form = event.target;
    const formData = {
        username: form.querySelector('#username').value.trim(),
        email: form.querySelector('#email').value.trim(),
        password: form.querySelector('#password').value,
        firstName: form.querySelector('#firstName').value.trim(),
        lastName: form.querySelector('#lastName').value.trim(),
        role: form.querySelector('#userRole').value,
        phone: (form.querySelector('#phone') && form.querySelector('#phone').value ? form.querySelector('#phone').value.trim() : '')
    };
    
    // Add role-specific fields
    const role = formData.role;
    if (role === 'student') {
        formData.studentId = (form.querySelector('#studentId') && form.querySelector('#studentId').value ? form.querySelector('#studentId').value.trim() : '');
        formData.course = (form.querySelector('#course') && form.querySelector('#course').value ? form.querySelector('#course').value.trim() : '');
        formData.semester = form.querySelector('#semester') && form.querySelector('#semester').value ? Number(form.querySelector('#semester').value) : undefined;
    } else if (role === 'faculty') {
        formData.employeeId = (form.querySelector('#employeeId') && form.querySelector('#employeeId').value ? form.querySelector('#employeeId').value.trim() : '');
        formData.department = (form.querySelector('#department') && form.querySelector('#department').value ? form.querySelector('#department').value.trim() : '');
        formData.designation = (form.querySelector('#designation') && form.querySelector('#designation').value ? form.querySelector('#designation').value.trim() : '');
        formData.specialization = (form.querySelector('#specialization') && form.querySelector('#specialization').value ? form.querySelector('#specialization').value.trim() : '');
        formData.qualification = (form.querySelector('#qualification') && form.querySelector('#qualification').value ? form.querySelector('#qualification').value.trim() : '');
        formData.experience = (form.querySelector('#experience') && form.querySelector('#experience').value ? Number(form.querySelector('#experience').value) : 0);
    }
    
    // Debug: Log the form data being sent
    console.log('Form data being sent:', formData);
    
    // Validated above; continue
    
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
            showEditUserModal(response.user, response.roleData);
        } else {
            showModalMessage('Error loading user details: ' + response.message);
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showModalMessage('Error loading user details: ' + error.message);
    }
}

function showEditUserModal(user, roleData = {}) {
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
    // Populate role-specific fields when available
    if (user.role === 'faculty' && roleData) {
        const emp = document.getElementById('editEmployeeId');
        const dept = document.getElementById('editDepartment');
        const desig = document.getElementById('editDesignation');
        const spec = document.getElementById('editSpecialization');
        const qual = document.getElementById('editQualification');
        const exp = document.getElementById('editExperience');
        if (emp) emp.value = roleData.employeeId || '';
        if (dept) dept.value = roleData.department || '';
        if (desig) desig.value = roleData.designation || '';
        if (spec) spec.value = roleData.specialization || '';
        if (qual) qual.value = roleData.qualification || '';
        if (exp) exp.value = roleData.experience || 0;
    } else if (user.role === 'student' && roleData) {
        const sid = document.getElementById('editStudentId');
        const course = document.getElementById('editCourse');
        const sem = document.getElementById('editSemester');
        const dept = document.getElementById('editDepartment');
        if (sid) sid.value = roleData.enrollmentNumber || '';
        if (course) course.value = roleData.program || '';
        if (dept && roleData.department) dept.value = roleData.department;
        if (sem && roleData.semester) sem.value = String(roleData.semester);
    }
    
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
    // Validate inline and prevent submit if invalid
    if (!validateEditUserForm(event.target, true)) {
        updateEditUserSubmitState(event.target);
        return;
    }
    
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
        formData.specialization = document.getElementById('editSpecialization').value.trim();
        formData.qualification = document.getElementById('editQualification').value.trim();
        formData.experience = Number(document.getElementById('editExperience').value) || 0;
    }
    
    const userId = document.getElementById('editUserId').value;
    
    // Show loading state
    const submitButton = document.querySelector('button[form="editUserForm"]');
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
    // Check both possible token storage locations
    let token = localStorage.getItem('authToken');
    if (!token) {
        token = localStorage.getItem('token');
    }
    
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

// ======================= PROFILE FUNCTIONALITY =======================

// Show profile modal and load user data
async function showProfile() {
    const modal = document.getElementById('profileModal');
    const profileContent = document.getElementById('profileContent');
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Show loading state
    profileContent.innerHTML = `
        <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b3d4f]"></div>
            <span class="ml-2 text-gray-600">Loading profile...</span>
        </div>
    `;
    
    try {
        // Check authentication status first
        console.log('LocalStorage check:', {
            authToken: localStorage.getItem('authToken'),
            token: localStorage.getItem('token'),
            userType: localStorage.getItem('userType'),
            currentUser: localStorage.getItem('currentUser')
        });
        
        if (!checkAuthStatus()) {
            showProfileError('Please log in to view your profile');
            return;
        }
        
        // Fetch user profile data using the existing apiRequest helper with cache busting
        const data = await apiRequest('/auth/profile', {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        console.log('Profile API Response:', data);
        
        if (data && data.success) {
            displayProfileData(data.user, data.roleData);
        } else {
            console.error('Profile API failed:', data);
            
            // Fallback: Try to display cached user data
            const cachedUser = localStorage.getItem('currentUser');
            if (cachedUser) {
                console.log('Using cached user data as fallback');
                const user = JSON.parse(cachedUser);
                displayProfileData(user, {});
            } else {
                showProfileError('Failed to load profile data');
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        
        // Fallback: Try to display cached user data even if API fails
        const cachedUser = localStorage.getItem('currentUser');
        if (cachedUser) {
            console.log('API failed, using cached user data as fallback');
            const user = JSON.parse(cachedUser);
            displayProfileData(user, {});
        } else {
            showProfileError('Error loading profile data');
        }
    }
}

// Display profile data in the modal
function displayProfileData(user, roleData) {
    const profileContent = document.getElementById('profileContent');
    
    // Get user type from localStorage or user role
    const userType = localStorage.getItem('userType') || user.role;
    
    console.log('Displaying profile for:', {
        user: user,
        roleData: roleData,
        userType: userType
    });
    
    // Create profile content based on user type
    let profileHTML = `
        <div class="text-center mb-6">
            <div class="w-24 h-24 bg-[#8b3d4f] text-white flex justify-center items-center text-3xl rounded-full mx-auto mb-4 font-bold">
                ${user.firstName[0]}${user.lastName[0]}
            </div>
            <h2 class="text-2xl font-bold text-gray-800">${user.firstName} ${user.lastName}</h2>
            <p class="text-gray-600 capitalize">${user.role}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-[#8b3d4f] border-b-2 border-gray-200 pb-2">Basic Information</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Username:</span>
                        <span class="text-gray-900">${user.username}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Email:</span>
                        <span class="text-gray-900">${user.email}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Phone:</span>
                        <span class="text-gray-900">${user.phone || 'Not provided'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Last Login:</span>
                        <span class="text-gray-900">${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Member Since:</span>
                        <span class="text-gray-900">${new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-[#8b3d4f] border-b-2 border-gray-200 pb-2">Role-Specific Information</h3>
                <div class="space-y-3">
    `;
    
    // Add role-specific information
    if (userType === 'student' && roleData) {
        profileHTML += `
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Student ID:</span>
                        <span class="text-gray-900">${roleData.enrollmentNumber || 'Not assigned'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Program:</span>
                        <span class="text-gray-900">${roleData.program || 'Not specified'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Year:</span>
                        <span class="text-gray-900">${roleData.year || 'Not specified'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Semester:</span>
                        <span class="text-gray-900">${roleData.semester || 'Not specified'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Department:</span>
                        <span class="text-gray-900">${roleData.department || 'Not specified'}</span>
                    </div>
        `;
    } else if (userType === 'faculty' && roleData) {
        profileHTML += `
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Employee ID:</span>
                        <span class="text-gray-900">${roleData.employeeId || 'Not assigned'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Department:</span>
                        <span class="text-gray-900">${roleData.department || 'Not specified'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Designation:</span>
                        <span class="text-gray-900">${roleData.designation || 'Not specified'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Specialization:</span>
                        <span class="text-gray-900">${roleData.specialization || 'Not specified'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Qualification:</span>
                        <span class="text-gray-900">${roleData.qualification || 'Not specified'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Experience:</span>
                        <span class="text-gray-900">${roleData.experience || 0} years</span>
                    </div>
        `;
    } else if (userType === 'admin') {
        profileHTML += `
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Role:</span>
                        <span class="text-gray-900">System Administrator</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Access Level:</span>
                        <span class="text-gray-900">Full System Access</span>
                    </div>
        `;
    } else {
        profileHTML += `
                    <div class="text-gray-500 italic">No additional information available</div>
        `;
    }
    
    profileHTML += `
                </div>
            </div>
        </div>
    `;
    
    profileContent.innerHTML = profileHTML;
}

// Show profile error
function showProfileError(message) {
    const profileContent = document.getElementById('profileContent');
    profileContent.innerHTML = `
        <div class="text-center">
            <div class="text-red-500 mb-4">
                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
            <p class="text-gray-600">${message}</p>
            <button onclick="showProfile()" class="mt-4 px-4 py-2 bg-[#8b3d4f] text-white rounded-md hover:bg-[#a24f63] transition-colors duration-200">
                Try Again
            </button>
        </div>
    `;
}

// Close profile modal
function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.add('hidden');
}

// Test function to verify token and display cached data
function testProfileData() {
    console.log('=== PROFILE DATA TEST ===');
    console.log('AuthToken:', localStorage.getItem('authToken'));
    console.log('CurrentUser:', localStorage.getItem('currentUser'));
    console.log('UserType:', localStorage.getItem('userType'));
    
    const cachedUser = localStorage.getItem('currentUser');
    if (cachedUser) {
        const user = JSON.parse(cachedUser);
        console.log('Parsed User:', user);
        displayProfileData(user, {});
    }
}

// Test direct fetch to profile API
async function testDirectProfileAPI() {
    const token = localStorage.getItem('authToken');
    console.log('=== DIRECT API TEST ===');
    console.log('Token:', token);
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            displayProfileData(data.user, data.roleData);
        }
    } catch (error) {
        console.error('Direct API test error:', error);
    }
}