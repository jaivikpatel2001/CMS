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
    const userType = document.querySelector('input[name="user-type"]:checked').value;
    
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
    
    // Simulate API call delay
    setTimeout(() => {
        // Check for demo credentials (in real app, this would be server-side validation)
        if (validateCredentials(username, password, userType)) {
            login(username, userType);
        } else {
            showError('login-error', 'Invalid username or password');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }, 1500);
}

// Validate credentials (demo function - replace with actual authentication)
function validateCredentials(username, password, userType) {
    // Demo credentials for testing
    const validCredentials = {
        student: { username: 'student', password: 'student123' },
        faculty: { username: 'faculty', password: 'faculty123' },
        admin: { username: 'admin', password: 'admin123' }
    };
    
    const credentials = validCredentials[userType];
    return credentials && username.toLowerCase() === credentials.username && password === credentials.password;
}

function login(username, userType) {
    // Get references to all pages
    const loginPage = document.getElementById('login-page');
    const studentDashboard = document.getElementById('student-dashboard');
    const facultyDashboard = document.getElementById('faculty-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');

    // Hide the login page and show the appropriate dashboard
    loginPage.classList.add('hidden');
    
    if (userType === 'student') {
        studentDashboard.classList.remove('hidden');
        // Update welcome message with actual username
        const welcomeElement = studentDashboard.querySelector('h2');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${username}`;
        }
    } else if (userType === 'faculty') {
        facultyDashboard.classList.remove('hidden');
        const welcomeElement = facultyDashboard.querySelector('h2');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${username}`;
        }
    } else if (userType === 'admin') {
        adminDashboard.classList.remove('hidden');
        const welcomeElement = adminDashboard.querySelector('h2');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${username}`;
        }
    }
    
    // Store login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', userType);
    localStorage.setItem('username', username);
}

// Select user type with visual feedback
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
}

/* 
 * This function handles the submission of a student complaint.
 * It logs the complaint details to the console and provides a simple message box.
 */
function submitComplaint() {
    const complaintType = document.getElementById('complaint-type').value;
    const complaintDetails = document.getElementById('complaint-details').value;

    if (complaintType === "" || complaintDetails.trim() === "") {
         showModalMessage("Please select a complaint type and provide details.");
         return;
    }

    // Simulate sending the complaint data to a server
    console.log("Complaint Submitted:");
    console.log("Type:", complaintType);
    console.log("Details:", complaintDetails);
    
    showModalMessage("Your complaint has been submitted successfully!");
}

/*
 * This function simulates the faculty viewing grades.
 * It logs the selected course to the console.
 */
function viewGrades() {
    const selectedCourse = document.querySelector('#faculty-dashboard select').value;
    console.log(`Faculty is viewing grades for: ${selectedCourse}`);
    showModalMessage(`Displaying grades for ${selectedCourse}.`);
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
