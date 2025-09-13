/*
 * This script handles the "login" and "logout" functionality
 * for all three user types (Student, Faculty, Admin).
 */

// Initialize the login form when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize forgot password form
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Initialize reset password form
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
    
    // Add password strength checking for reset password form
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
});

// Handle form submission with validation
function handleLogin(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Get form data
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate inputs
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
    
    if (!isValid) {
        return;
    }
    
    // Simulate login process with loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing In...';
    submitButton.disabled = true;
    
    // Use real API validation - determine user type from email/username
    try {
        const userType = determineUserType(username);
        const isValid = await validateCredentials(username, password, userType);
        if (isValid) {
            login(username, userType);
        } else {
            showError('login-error', 'Invalid username or password');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    } catch (error) {
        showError('login-error', 'Login failed. Please try again.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Determine user type from email/username
function determineUserType(username) {
    // Check if it's an email
    if (username.includes('@')) {
        if (username.includes('admin@silveroakuni.ac.in')) {
            return 'admin';
        } else if (username.includes('@silveroakuni.ac.in')) {
            // Check if it's a faculty email (employee ID format)
            if (username.match(/^\d{5}@silveroakuni\.ac\.in$/)) {
                return 'faculty';
            }
            // Check if it's a student email (enrollment number format)
            else if (username.match(/^\d{13}@silveroakuni\.ac\.in$/)) {
                return 'student';
            }
        }
    }
    
    // Check if it's a username
    if (username.toLowerCase() === 'admin') {
        return 'admin';
    } else if (username.toLowerCase().startsWith('faculty')) {
        return 'faculty';
    } else if (username.toLowerCase().startsWith('student')) {
        return 'student';
    }
    
    // Default to student if can't determine
    return 'student';
}

// Validate credentials using real API
async function validateCredentials(username, password, userType) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                role: userType
            })
        });
        
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

async function login(username, userType) {
    // Get references to all pages
    const loginPage = document.getElementById('login-page');
    const studentDashboard = document.getElementById('student-dashboard');
    const facultyDashboard = document.getElementById('faculty-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');

    // Hide the login page and show the appropriate dashboard
    loginPage.classList.add('hidden');
    
    // Store login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', userType);
    localStorage.setItem('username', username);
    
    if (userType === 'student') {
        studentDashboard.classList.remove('hidden');
        // Load student data dynamically
        await loadStudentData(username);
    } else if (userType === 'faculty') {
        facultyDashboard.classList.remove('hidden');
        // Load faculty data dynamically
        await loadFacultyData(username);
    } else if (userType === 'admin') {
        adminDashboard.classList.remove('hidden');
        // Load admin data dynamically
        await loadAdminData(username);
    }
}


// Toggle password visibility
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

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

// Clear all error messages
function clearErrors() {
    const errorElements = ['username-error', 'password-error', 'login-error'];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function logout() {
    // Get references to all pages
    const loginPage = document.getElementById('login-page');
    const studentDashboard = document.getElementById('student-dashboard');
    const facultyDashboard = document.getElementById('faculty-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');

    // Hide all dashboards and show the login page
    studentDashboard.classList.add('hidden');
    facultyDashboard.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    loginPage.classList.remove('hidden'); // Show login page
    
    // Reset login button text
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    if (loginButton) {
        loginButton.textContent = 'Login';
        loginButton.disabled = false;
    }
    
    // Clear stored data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
}

/* 
 * This function handles the submission of a student complaint.
 * It submits the complaint to the backend API.
 */
async function submitComplaint() {
    const complaintType = document.getElementById('complaint-type').value;
    const complaintDetails = document.getElementById('complaint-details').value;

    if (complaintType === "" || complaintDetails.trim() === "") {
         showModalMessage("Please select a complaint type and provide details.");
         return;
    }

    try {
        const response = await fetch('/api/student/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
                complaintType,
                subject: complaintType.charAt(0).toUpperCase() + complaintType.slice(1) + ' Issue',
                description: complaintDetails,
                priority: 'medium'
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showModalMessage("Your complaint has been submitted successfully!");
                // Clear the form
                document.getElementById('complaint-type').value = '';
                document.getElementById('complaint-details').value = '';
                document.getElementById('complaint-word-count').textContent = '0';
            } else {
                showModalMessage("Error submitting complaint: " + data.message);
            }
        } else {
            showModalMessage("Error submitting complaint. Please try again.");
        }
    } catch (error) {
        console.error('Error submitting complaint:', error);
        showModalMessage("Error submitting complaint. Please try again.");
    }
}

// Update complaint word count
function updateComplaintWordCount() {
    const textarea = document.getElementById('complaint-details');
    const wordCount = document.getElementById('complaint-word-count');
    if (textarea && wordCount) {
        const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = words.length;
    }
}

/*
 * A simple custom modal message box to replace alert().
 * Styled with Tailwind CSS.
 */
function showModalMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center';

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

// ======================= FORGOT PASSWORD FUNCTIONALITY =======================

// Show forgot password page
function showForgotPassword() {
    const loginPage = document.getElementById('login-page');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    
    loginPage.classList.add('hidden');
    forgotPasswordPage.classList.remove('hidden');
    forgotPasswordPage.classList.add('page-transition');
}

// Show login page (used for navigation back)
function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    const resetPasswordPage = document.getElementById('reset-password-page');
    
    forgotPasswordPage.classList.add('hidden');
    resetPasswordPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginPage.classList.add('page-transition');
}

// Select user type for forgot password
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

// Toggle new password visibility
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

// Toggle confirm password visibility
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

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthIndicator = document.getElementById('password-strength-indicator');
    
    if (!strengthIndicator) {
        // Create strength indicator if it doesn't exist
        const passwordField = document.getElementById('new-password').parentNode;
        const strengthDiv = document.createElement('div');
        strengthDiv.id = 'password-strength-indicator';
        strengthDiv.className = 'password-strength';
        strengthDiv.innerHTML = '<div class="password-strength-bar"></div>';
        passwordField.appendChild(strengthDiv);
    }
    
    const strength = calculatePasswordStrength(password);
    const strengthBar = document.querySelector('.password-strength-bar');
    
    // Remove all strength classes
    strengthBar.className = 'password-strength-bar';
    
    if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#e5e7eb';
    } else {
        strengthBar.style.width = strength.width + '%';
        strengthBar.style.backgroundColor = strength.color;
    }
}

// Calculate password strength
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

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
    return password.length >= 8 &&
           /[a-z]/.test(password) &&
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
}

// Show forgot password error
function showForgotPasswordError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

// Show forgot password success
function showForgotPasswordSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    }
}

// Show reset password error
function showResetPasswordError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

// Show reset password success
function showResetPasswordSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    }
}

// Clear forgot password errors
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

// Clear reset password errors
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

// ======================= DATA LOADING FUNCTIONS =======================

// Load student data dynamically
async function loadStudentData(username) {
    try {
        // Get student profile
        const response = await fetch('/api/student/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateStudentDashboard(data.student);
            }
        }
        
        // Load announcements
        await loadStudentAnnouncements();
        
        // Load assignments
        await loadStudentAssignments();
        
        // Load grades
        await loadStudentGrades();
        
        // Load attendance
        await loadStudentAttendance();
        
    } catch (error) {
        console.error('Error loading student data:', error);
    }
}

// Load faculty data dynamically
async function loadFacultyData(username) {
    try {
        // Get faculty profile
        const response = await fetch('/api/faculty/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateFacultyDashboard(data.faculty);
            }
        }
        
        // Load announcements
        await loadFacultyAnnouncements();
        
        // Load courses
        await loadFacultyCourses();
        
    } catch (error) {
        console.error('Error loading faculty data:', error);
    }
}

// Load admin data dynamically
async function loadAdminData(username) {
    try {
        // Load statistics
        await loadAdminStatistics();
        
        // Load announcements
        await loadAdminAnnouncements();
        
        // Load complaints
        await loadAdminComplaints();
        
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Update student dashboard with real data
function updateStudentDashboard(student) {
    const welcomeElement = document.querySelector('#student-dashboard h2');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${student.userId.firstName} ${student.userId.lastName}`;
    }
    
    // Update student details
    const detailsCard = document.querySelector('#student-dashboard .bg-white:first-child');
    if (detailsCard) {
        const avatar = detailsCard.querySelector('.w-16.h-16');
        if (avatar) {
            avatar.textContent = `${student.userId.firstName[0]}${student.userId.lastName[0]}`;
        }
        
        const nameElement = detailsCard.querySelector('.font-bold.text-lg');
        if (nameElement) {
            nameElement.textContent = `${student.userId.firstName} ${student.userId.lastName}`;
        }
        
        const studentIdElement = detailsCard.querySelector('.text-sm.text-gray-600');
        if (studentIdElement) {
            studentIdElement.textContent = `Student ID: ${student.enrollmentNumber}`;
        }
        
        const programElement = studentIdElement?.nextElementSibling;
        if (programElement) {
            programElement.textContent = `Program: ${student.program}`;
        }
        
        const yearElement = programElement?.nextElementSibling;
        if (yearElement) {
            yearElement.textContent = `Year: ${student.year}`;
        }
        
        const emailElement = yearElement?.nextElementSibling;
        if (emailElement) {
            emailElement.textContent = `Email: ${student.userId.email}`;
        }
    }
}

// Update faculty dashboard with real data
function updateFacultyDashboard(faculty) {
    const welcomeElement = document.querySelector('#faculty-dashboard h2');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${faculty.userId.firstName} ${faculty.userId.lastName}`;
    }
}

// Load student announcements
async function loadStudentAnnouncements() {
    try {
        const response = await fetch('/api/student/announcements', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const announcementsList = document.getElementById('student-announcements-list');
                if (announcementsList) {
                    announcementsList.innerHTML = '';
                    data.announcements.forEach(announcement => {
                        const li = document.createElement('li');
                        li.className = 'border-l-4 border-[#8b3d4f] pl-4 py-2';
                        li.innerHTML = `
                            <h4 class="font-semibold text-gray-800">${announcement.title}</h4>
                            <p class="text-sm text-gray-600">${announcement.content}</p>
                            <p class="text-xs text-gray-500 mt-1">By: ${announcement.author.name} - ${new Date(announcement.publishDate).toLocaleDateString()}</p>
                        `;
                        announcementsList.appendChild(li);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading student announcements:', error);
    }
}

// Load faculty announcements
async function loadFacultyAnnouncements() {
    try {
        const response = await fetch('/api/faculty/announcements', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const announcementsList = document.getElementById('faculty-admin-announcements');
                if (announcementsList) {
                    announcementsList.innerHTML = '';
                    data.announcements.forEach(announcement => {
                        const li = document.createElement('li');
                        li.className = 'border-l-4 border-[#8b3d4f] pl-4 py-2';
                        li.innerHTML = `
                            <h4 class="font-semibold text-gray-800">${announcement.title}</h4>
                            <p class="text-sm text-gray-600">${announcement.content}</p>
                            <p class="text-xs text-gray-500 mt-1">By: ${announcement.author.name} - ${new Date(announcement.publishDate).toLocaleDateString()}</p>
                        `;
                        announcementsList.appendChild(li);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading faculty announcements:', error);
    }
}

// Load faculty courses
async function loadFacultyCourses() {
    try {
        const response = await fetch('/api/faculty/courses', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Update courses list
                const coursesList = document.querySelector('#faculty-dashboard .bg-white:first-child ul');
                if (coursesList) {
                    coursesList.innerHTML = '';
                    data.courses.forEach(course => {
                        const li = document.createElement('li');
                        li.textContent = `${course.subjectCode} - ${course.subjectName}`;
                        coursesList.appendChild(li);
                    });
                }
                
                // Update course selects
                const selects = document.querySelectorAll('#faculty-dashboard select');
                selects.forEach(select => {
                    select.innerHTML = '<option value="">Select a course...</option>';
                    data.courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course.subjectCode;
                        option.textContent = `${course.subjectCode} - ${course.subjectName}`;
                        select.appendChild(option);
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error loading faculty courses:', error);
    }
}

// Load student assignments
async function loadStudentAssignments() {
    try {
        const response = await fetch('/api/student/assignments', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Update assignments list
                const assignmentsList = document.querySelector('#student-dashboard .bg-white:nth-child(3) ul');
                if (assignmentsList) {
                    assignmentsList.innerHTML = '';
                    data.assignments.forEach(assignment => {
                        const li = document.createElement('li');
                        li.className = 'flex justify-between items-center py-2 border-b border-gray-200';
                        li.innerHTML = `
                            <div>
                                <h4 class="font-semibold">${assignment.title}</h4>
                                <p class="text-sm text-gray-600">${assignment.subjectName}</p>
                                <p class="text-xs text-gray-500">Due: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
                            </div>
                            <span class="px-2 py-1 text-xs rounded ${assignment.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${assignment.status}</span>
                        `;
                        assignmentsList.appendChild(li);
                    });
                }
                
                // Update assignment select
                const assignmentSelect = document.getElementById('select-assignment');
                if (assignmentSelect) {
                    assignmentSelect.innerHTML = '<option value="">Choose an assignment...</option>';
                    data.assignments.forEach(assignment => {
                        const option = document.createElement('option');
                        option.value = assignment._id;
                        option.textContent = `${assignment.title} - ${assignment.subjectName}`;
                        assignmentSelect.appendChild(option);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading student assignments:', error);
    }
}

// Load student grades
async function loadStudentGrades() {
    try {
        const response = await fetch('/api/student/grades', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const gradesTable = document.querySelector('#student-dashboard .bg-white:nth-child(2) tbody');
                if (gradesTable) {
                    gradesTable.innerHTML = '';
                    data.grades.forEach(grade => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${grade.subjectName}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${grade.marks.obtained}/${grade.marks.total}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${grade.grade}</td>
                        `;
                        gradesTable.appendChild(row);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading student grades:', error);
    }
}

// Load student attendance
async function loadStudentAttendance() {
    try {
        const response = await fetch('/api/student/attendance', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const attendanceElement = document.querySelector('#student-dashboard .progress-circle');
                if (attendanceElement) {
                    attendanceElement.textContent = `${data.attendancePercentage}%`;
                }
            }
        }
    } catch (error) {
        console.error('Error loading student attendance:', error);
    }
}

// Load admin statistics
async function loadAdminStatistics() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('totalStudents').textContent = data.totalStudents;
                document.getElementById('totalFaculty').textContent = data.totalFaculty;
                document.getElementById('activeCourses').textContent = data.activeCourses;
                document.getElementById('totalUsers').textContent = data.totalUsers;
                document.getElementById('totalComplaints').textContent = data.totalComplaints;
                document.getElementById('recentStudents').textContent = data.recentStudents;
            }
        }
    } catch (error) {
        console.error('Error loading admin statistics:', error);
    }
}

// Load admin announcements
async function loadAdminAnnouncements() {
    try {
        const response = await fetch('/api/admin/announcements', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Update announcements list if needed
            }
        }
    } catch (error) {
        console.error('Error loading admin announcements:', error);
    }
}

// Load admin complaints
async function loadAdminComplaints() {
    try {
        const response = await fetch('/api/admin/complaints', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const complaintsList = document.querySelector('#admin-dashboard .bg-white:nth-child(4) ul');
                if (complaintsList) {
                    complaintsList.innerHTML = '';
                    data.complaints.forEach(complaint => {
                        const li = document.createElement('li');
                        li.className = 'border-l-4 border-[#8b3d4f] pl-4 py-2';
                        li.innerHTML = `
                            <h4 class="font-semibold text-gray-800">${complaint.subject}</h4>
                            <p class="text-sm text-gray-600">${complaint.description}</p>
                            <p class="text-xs text-gray-500 mt-1">By: ${complaint.studentName} - ${new Date(complaint.submittedAt).toLocaleDateString()}</p>
                            <span class="px-2 py-1 text-xs rounded ${complaint.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${complaint.status}</span>
                        `;
                        complaintsList.appendChild(li);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading admin complaints:', error);
    }
}
