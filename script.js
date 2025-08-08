// Navigation Menu Toggle
function showMenu() {
    document.getElementById('navLinks').style.right = '0';
}

function hideMenu() {
    document.getElementById('navLinks').style.right = '-200px';
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide mobile menu if open
            hideMenu();
            
            // Get the target element
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate position to scroll to (with offset for fixed header)
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                // Scroll to the target
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Countdown Timer
document.addEventListener('DOMContentLoaded', function() {
    // Set the date we're counting down to (July 17, 2026)
    const countDownDate = new Date('July 17, 2026 09:00:00').getTime();
    
    // Update the countdown every 1 second
    const countdownTimer = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Find the distance between now and the countdown date
        const distance = countDownDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display the result
        document.getElementById('days').innerHTML = days.toString().padStart(3, '0');
        document.getElementById('hours').innerHTML = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerHTML = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerHTML = seconds.toString().padStart(2, '0');
        
        // If the countdown is finished, display a message
        if (distance < 0) {
            clearInterval(countdownTimer);
            document.getElementById('days').innerHTML = '000';
            document.getElementById('hours').innerHTML = '00';
            document.getElementById('minutes').innerHTML = '00';
            document.getElementById('seconds').innerHTML = '00';
        }
    }, 1000);
});

// Schedule Tabs
function showSchedule(dayId) {
    // Hide all schedule content
    const scheduleContents = document.getElementsByClassName('schedule-content');
    for (let i = 0; i < scheduleContents.length; i++) {
        scheduleContents[i].classList.remove('active');
    }
    
    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show the selected day content
    const selectedDay = document.getElementById(dayId);
    if (selectedDay) {
        selectedDay.classList.add('active');
    }
    
    // Add active class to the clicked button
    const clickedButton = event.target;
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// Alternative function for backward compatibility
function openDay(evt, dayId) {
    // Hide all schedule content
    const scheduleContents = document.getElementsByClassName('schedule-content');
    for (let i = 0; i < scheduleContents.length; i++) {
        scheduleContents[i].classList.remove('active');
    }
    
    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show the current tab and add active class to the button
    document.getElementById(dayId).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// FAQ Toggle
function toggleFaq(element) {
    const faqItem = element.parentElement;
    faqItem.classList.toggle('active');
    
    // Toggle icon
    const icon = element.querySelector('i');
    if (faqItem.classList.contains('active')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// Update total amount calculation
function updateTotalAmount() {
    const registrationSelect = document.getElementById('registrationType');
    const registrationFeeElement = document.getElementById('registration-fee');
    const optionalFeeElement = document.getElementById('optional-fee');
    const totalAmountElement = document.getElementById('total-amount');
    const optionalBreakdown = document.getElementById('optional-breakdown');
    
    // Get registration fee
    let registrationFee = 0;
    let registrationText = 'Not Selected';
    
    if (registrationSelect && registrationSelect.value && registrationSelect.value !== '') {
        const registrationPrices = {
            'early-bird': { price: 260, text: 'Early Bird' },
            'standard': { price: 390, text: 'Standard' },
            'late': { price: 430, text: 'Late' }
        };
        
        const selectedPackage = registrationPrices[registrationSelect.value];
        if (selectedPackage) {
            registrationFee = selectedPackage.price;
            registrationText = selectedPackage.text;
        }
    }
    
    // Get optional programs fee
    let optionalFee = 0;
    const optionalPrograms = [
        document.getElementById('poolsideParty'),
        document.getElementById('communityService'),
        document.getElementById('installationBanquet')
    ];
    
    optionalPrograms.forEach(select => {
        if (select && select.value && select.value !== '') {
            const selectedOption = select.options[select.selectedIndex];
            const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
            optionalFee += price;
        }
    });
    
    // Update display
    if (registrationFeeElement) {
        registrationFeeElement.textContent = `RM${registrationFee}`;
    }
    
    if (optionalFeeElement) {
        optionalFeeElement.textContent = `RM${optionalFee}`;
    }
    
    if (optionalBreakdown) {
        optionalBreakdown.style.display = optionalFee > 0 ? 'flex' : 'none';
    }
    
    if (totalAmountElement) {
        const total = registrationFee + optionalFee;
        totalAmountElement.textContent = `RM${total}`;
    }
    
    // Debug logging
    console.log('Registration Fee:', registrationFee, 'Optional Fee:', optionalFee, 'Total:', registrationFee + optionalFee);
}

// Function to toggle other district field
function toggleOtherDistrict() {
    const districtSelect = document.getElementById('district');
    const otherDistrictGroup = document.getElementById('otherDistrictGroup');
    const otherDistrictInput = document.getElementById('otherDistrict');
    
    if (districtSelect.value === 'Other District') {
        otherDistrictGroup.style.display = 'block';
        otherDistrictInput.required = true;
    } else {
        otherDistrictGroup.style.display = 'none';
        otherDistrictInput.required = false;
        otherDistrictInput.value = '';
    }
}

// Live Registration Counter Functions
async function fetchRegistrationCounts() {
    try {
        const response = await fetch('/api/register');
        if (response.ok) {
            const data = await response.json();
            // Transform the production API response to match expected format
            const transformedData = {
                counts: {
                    total: data.total_registrations || 0,
                    earlyBird: data.early_bird_count || 0,
                    recent24h: data.recent_24h_count || 0
                },
                earlyBird: {
                    available: (data.early_bird_count || 0) < 150,
                    remaining: Math.max(0, 150 - (data.early_bird_count || 0)),
                    percentage: Math.round(((data.early_bird_count || 0) / 150) * 100)
                }
            };
            updateCounterDisplay(transformedData);
            return transformedData;
        }
    } catch (error) {
        console.log('Production API not available, trying fallback...');
        // Try fallback endpoints
        try {
            const fallbackResponse = await fetch('/api/register-working');
            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                const transformedData = {
                    counts: {
                        total: fallbackData.total_registrations || 0,
                        earlyBird: fallbackData.early_bird_count || 0,
                        recent24h: fallbackData.recent_24h_count || 0
                    },
                    earlyBird: {
                        available: (fallbackData.early_bird_count || 0) < 150,
                        remaining: Math.max(0, 150 - (fallbackData.early_bird_count || 0)),
                        percentage: Math.round(((fallbackData.early_bird_count || 0) / 150) * 100)
                    }
                };
                updateCounterDisplay(transformedData);
                return transformedData;
            }
        } catch (fallbackError) {
            console.log('Fallback API also not available, using localStorage...');
        }
        
        // Final fallback to localStorage count
        const localRegistrations = JSON.parse(localStorage.getItem('conventionRegistrations') || '[]');
        const fallbackData = {
            counts: {
                total: localRegistrations.length,
                earlyBird: localRegistrations.filter(r => r.registrationType === 'early-bird').length,
                recent24h: 0
            },
            earlyBird: {
                available: true,
                remaining: 100 - localRegistrations.filter(r => r.registrationType === 'early-bird').length,
                percentage: Math.round((localRegistrations.filter(r => r.registrationType === 'early-bird').length / 100) * 100)
            }
        };
        updateCounterDisplay(fallbackData);
        return fallbackData;
    }
}

function updateCounterDisplay(data) {
    const totalCountEl = document.getElementById('totalCount');
    const earlyBirdCountEl = document.getElementById('earlyBirdCount');
    const recentCountEl = document.getElementById('recentCount');
    const earlyBirdRemainingEl = document.getElementById('earlyBirdRemaining');
    const progressBarEl = document.getElementById('earlyBirdProgress');

    if (totalCountEl) totalCountEl.textContent = data.counts?.total || 0;
    if (earlyBirdCountEl) earlyBirdCountEl.textContent = data.counts?.earlyBird || 0;
    if (recentCountEl) recentCountEl.textContent = data.counts?.recent24h || 0;
    if (earlyBirdRemainingEl) earlyBirdRemainingEl.textContent = `${data.earlyBird?.remaining || 0} remaining`;
    
    if (progressBarEl) {
        const percentage = data.earlyBird?.percentage || 0;
        progressBarEl.style.width = `${percentage}%`;
    }

    // Update early bird availability in registration form
    updateEarlyBirdAvailability(data.earlyBird?.available || false);
}

function updateEarlyBirdAvailability(isAvailable) {
    const earlyBirdOption = document.querySelector('input[value="early-bird"]');
    const earlyBirdLabel = document.querySelector('label[for="early-bird"]');
    
    if (earlyBirdOption && earlyBirdLabel) {
        if (!isAvailable) {
            earlyBirdOption.disabled = true;
            earlyBirdLabel.style.opacity = '0.5';
            earlyBirdLabel.innerHTML += ' <span style="color: #ff6b6b;">(SOLD OUT)</span>';
        }
    }
}

// Auto-refresh registration counts every 30 seconds
function startLiveCountUpdates() {
    fetchRegistrationCounts(); // Initial load
    setInterval(fetchRegistrationCounts, 30000); // Update every 30 seconds
}

// Initialize total calculation on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize total calculation
    updateTotalAmount();
    startLiveCountUpdates(); // Start live count updates
    
    // Add event listeners to all optional program dropdowns
    const optionalDropdowns = [
        document.getElementById('poolsideParty'),
        document.getElementById('communityService'),
        document.getElementById('installationBanquet')
    ];
    optionalDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.addEventListener('change', updateTotalAmount);
        }
    });
    
    // Add event listener to registration type select
    const registrationSelect = document.getElementById('registrationType');
    if (registrationSelect) {
        registrationSelect.addEventListener('change', function() {
            console.log('Registration type changed:', this.value);
            updateTotalAmount();
        });
    }
    
    // Form Validation and Submission
    const registrationForm = document.getElementById('registrationForm');
    const formMessage = document.getElementById('form-message');
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous messages
            hideFormMessage();
            
            // Validate form
            if (!validateForm()) {
                showFormMessage('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;
            
            try {
                // Check if file is selected
                const fileInput = document.getElementById('payment-slip');
                const file = fileInput.files[0];
                
                if (!file) {
                    showFormMessage('请上传您的支付凭条。', 'error');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    return;
                }
                
                // Show upload status
                const uploadStatus = document.getElementById('upload-status');
                if (uploadStatus) {
                    uploadStatus.textContent = '正在上传文件...';
                    uploadStatus.className = 'info';
                }
                
                // Convert file to base64 using the global function from file-upload.js
                const base64Data = await window.fileToBase64(file);
                
                // Upload file to server
                let fileUrl = '';
                try {
                    console.log('开始上传文件...');
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            fileData: base64Data,
                            fileName: file.name,
                            fileType: file.type
                        })
                    });
                    
                    console.log('文件上传响应状态:', uploadResponse.status);
                    const uploadResult = await uploadResponse.json();
                    console.log('文件上传响应:', uploadResult);
                    
                    if (uploadResponse.ok) {
                        fileUrl = uploadResult.file.url;
                        
                        if (uploadStatus) {
                            uploadStatus.textContent = '文件上传成功!';
                            uploadStatus.className = 'success';
                        }
                    } else {
                        if (uploadStatus) {
                            uploadStatus.textContent = '文件上传失败。继续注册...';
                            uploadStatus.className = 'warning';
                        }
                    }
                } catch (uploadError) {
                    console.error('文件上传错误:', uploadError);
                    if (uploadStatus) {
                        uploadStatus.textContent = '文件上传失败。继续注册...';
                        uploadStatus.className = 'warning';
                    }
                }
                
                // Collect form data
                const formData = new FormData(registrationForm);
                const registrationData = Object.fromEntries(formData.entries());
                
                // Add file URL if available
                if (fileUrl) {
                    registrationData.paymentSlipUrl = fileUrl;
                }
                
                // Add timestamp
                registrationData.registrationDate = new Date().toISOString();
                registrationData.registrationId = generateRegistrationId();
                
                // Submit registration data
                try {
                    console.log('开始提交注册数据...');
                    console.log('注册数据:', registrationData);
                    
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(registrationData)
                    });

                    console.log('注册响应状态:', response.status);
                    const result = await response.json();
                    console.log('注册响应:', result);

                    if (response.ok) {
                        showFormMessage('注册成功！我们将很快与您联系。', 'success');
                        registrationForm.reset();
                        updateTotalAmount(); // Reset the total calculation
                        
                        // Reset file preview using the global function from file-upload.js
                        if (window.resetFilePreview) {
                            window.resetFilePreview();
                        } else {
                            // Fallback if the global function is not available
                            const previewContainer = document.getElementById('file-preview-container');
                            if (previewContainer) {
                                previewContainer.innerHTML = '';
                                previewContainer.style.display = 'none';
                            }
                        }
                        
                        if (uploadStatus) {
                            uploadStatus.textContent = '';
                            uploadStatus.className = '';
                        }
                    } else {
                        throw new Error(result.message || '注册失败。请重试。');
                    }
                } catch (submitError) {
                    console.error('注册错误:', submitError);
                    // Try the submitRegistration function as fallback
                    const response = await submitRegistration(registrationData);
                    
                    if (response.success) {
                        showFormMessage(`Registration successful! Your registration ID is: ${registrationData.registrationId}. A confirmation email will be sent shortly.`, 'success');
                        registrationForm.reset();
                        updateTotalAmount(); // Reset the total calculation
                        
                        // Reset file preview
                        const filePreviewContainer = document.getElementById('file-preview-container');
                        if (filePreviewContainer) {
                            filePreviewContainer.style.display = 'none';
                        }
                    } else {
                        throw new Error(response.message || 'Registration failed');
                    }
                }
                
            } catch (error) {
                console.error('Registration error:', error);
                showFormMessage('发生错误。请稍后再试。', 'error');
            } finally {
                // Restore button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
        
        // Helper function to convert file to base64
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
    }
});

// Form validation function
function validateForm() {
    let isValid = true;
    const requiredFields = document.querySelectorAll('#registrationForm [required]');
    
    // Clear previous error states
    document.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
    
    // Validate required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        }
    });
    
    // Email validation
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
        }
    }
    
    // Phone validation (basic)
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value) {
        const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phonePattern.test(phoneField.value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            phoneField.classList.add('error');
        }
    }
    
    return isValid;
}

// Submit registration to production API
async function submitRegistration(data) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Registration failed');
        }

        // Also save to localStorage as backup
        const existingRegistrations = JSON.parse(localStorage.getItem('conventionRegistrations') || '[]');
        existingRegistrations.push(data);
        localStorage.setItem('conventionRegistrations', JSON.stringify(existingRegistrations));
        
        return result;
    } catch (error) {
        console.error('Production API error, trying fallback...', error);
        
        // Try fallback endpoint
        try {
            const fallbackResponse = await fetch('/api/register-working', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const fallbackResult = await fallbackResponse.json();
            
            if (fallbackResponse.ok) {
                // Also save to localStorage as backup
                const existingRegistrations = JSON.parse(localStorage.getItem('conventionRegistrations') || '[]');
                existingRegistrations.push(data);
                localStorage.setItem('conventionRegistrations', JSON.stringify(existingRegistrations));
                
                return fallbackResult;
            }
        } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
        }
        
        // Final fallback to localStorage if all APIs fail
        try {
            const existingRegistrations = JSON.parse(localStorage.getItem('conventionRegistrations') || '[]');
            existingRegistrations.push(data);
            localStorage.setItem('conventionRegistrations', JSON.stringify(existingRegistrations));
            
            return {
                success: true,
                message: 'Registration saved locally. Will sync when database is available.',
                registrationId: data.registrationId,
                fallback: true
            };
        } catch (fallbackError) {
            return {
                success: false,
                message: 'Registration failed. Please try again.'
            };
        }
    }
}

// Generate unique registration ID
function generateRegistrationId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `APC2026-${timestamp}-${randomStr}`.toUpperCase();
}

// Show form message
function showFormMessage(message, type) {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Hide form message
function hideFormMessage() {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';
    }
}

// Sticky Header
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.hero');
    
    if (header && heroSection) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }
});

// Animate elements when they come into view
document.addEventListener('DOMContentLoaded', function() {
    // Add a class to elements when they come into view
    function animateOnScroll() {
        const elements = document.querySelectorAll('.section-title, .about-content, .speakers-grid, .schedule-tabs, .venue-content, .pricing-cards, .registration-form, .faq-container, .sponsor-level');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animate');
            }
        });
    }
    
    // Run on initial load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
});

// Utility functions for viewing and clearing registrations
async function viewRegistrations() {
    try {
        // Try to fetch from API first
        const response = await fetch('/api/admin/registrations');
        if (response.ok) {
            const result = await response.json();
            console.log('Database Registrations:', result.registrations);
            console.log('Statistics:', result.statistics);
            return result;
        }
    } catch (error) {
        console.log('API not available, checking localStorage...');
    }
    
    // Fallback to localStorage
    const registrations = JSON.parse(localStorage.getItem('conventionRegistrations') || '[]');
    console.log('LocalStorage Registrations:', registrations);
    console.log(`Total registrations: ${registrations.length}`);
    return { registrations, source: 'localStorage' };
}

function clearAllRegistrations() {
    localStorage.removeItem('conventionRegistrations');
    console.log('All registrations cleared');
}