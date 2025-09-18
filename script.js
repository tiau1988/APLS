// Navigation Menu Toggle
function showMenu() {
    document.getElementById('navLinks').style.right = '0';
}

function hideMenu() {
    document.getElementById('navLinks').style.right = '-200px';
}

// Country code mapping
const countryCodeMap = {
    'Malaysia - Sabah': '+60',
    'Malaysia - Sarawak': '+60',
    'Malaysia - West Malaysia': '+60',
    'Australia': '+61',
    'Brunei': '+673',
    'Cambodia': '+855',
    'China': '+86',
    'Hong Kong': '+852',
    'United States': '+1',
    'Indonesia': '+62',
    'Japan': '+81',
    'Korea': '+82',
    'Macau': '+853',
    'Mongolia': '+976',
    'Bhutan': '+975',
    'New Zealand': '+64',
    'Guam': '+1',
    'Singapore': '+65',
    'Philippines': '+63',
    'Taipei': '+886',
    'Thailand': '+66',
    'Vietnam': '+84',
    'Sri Lanka': '+94'
};

// Auto-populate country code based on residence country selection
function setupCountryCodeAutofill() {
    const residenceCountrySelect = document.getElementById('residenceCountry');
    const phoneInput = document.getElementById('phone');
    
    if (residenceCountrySelect && phoneInput) {
        residenceCountrySelect.addEventListener('change', function() {
            const selectedCountry = this.value;
            const countryCode = countryCodeMap[selectedCountry];
            
            if (countryCode) {
                // Check if phone field is empty or only contains a country code
                const currentValue = phoneInput.value.trim();
                const isEmptyOrOnlyCountryCode = !currentValue || 
                    Object.values(countryCodeMap).some(code => currentValue === code || currentValue === code + ' ');
                
                if (isEmptyOrOnlyCountryCode) {
                    phoneInput.value = countryCode + ' ';
                    phoneInput.focus();
                    // Position cursor after the country code
                    phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
                }
            }
        });
    }
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
    
    // Initialize country code autofill functionality
    setupCountryCodeAutofill();
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

// Date-based pricing logic
function updatePricingOptions() {
    const registrationSelect = document.getElementById('registrationType');
    if (!registrationSelect) return;
    
    const currentDate = new Date();
    const package1End = new Date('2025-11-30T23:59:59'); // Package 1: 15 Aug 2025 - 30 Nov 2025
    const package2End = new Date('2026-02-28T23:59:59'); // Package 2: 1 Dec 2025 - 28 Feb 2026
    const package3End = new Date('2026-05-31T23:59:59'); // Package 3: 1 Mar 2026 - 31 May 2026
    
    // Get all options
    const package1Option = registrationSelect.querySelector('option[value="package-1"]');
    const package2Option = registrationSelect.querySelector('option[value="package-2"]');
    const package3Option = registrationSelect.querySelector('option[value="package-3"]');
    
    // Reset all options to visible
    if (package1Option) package1Option.style.display = 'block';
    if (package2Option) package2Option.style.display = 'block';
    if (package3Option) package3Option.style.display = 'block';
    
    // Auto-select and hide options based on current date
    if (currentDate <= package1End) {
        // Current period: Package 1 (15 Aug 2025 - 30 Nov 2025)
        if (package1Option && !registrationSelect.value) {
            registrationSelect.value = 'package-1';
        }
        // Hide future packages
        if (package2Option) package2Option.style.display = 'none';
        if (package3Option) package3Option.style.display = 'none';
    } else if (currentDate <= package2End) {
        // Current period: Package 2 (1 Dec 2025 - 28 Feb 2026)
        if (package2Option && !registrationSelect.value) {
            registrationSelect.value = 'package-2';
        }
        // Hide past and future packages
        if (package1Option) package1Option.style.display = 'none';
        if (package3Option) package3Option.style.display = 'none';
        // Reset if package-1 was selected
        if (registrationSelect.value === 'package-1') {
            registrationSelect.value = 'package-2';
        }
    } else if (currentDate <= package3End) {
        // Current period: Package 3 (1 Mar 2026 - 31 May 2026)
        if (package3Option && !registrationSelect.value) {
            registrationSelect.value = 'package-3';
        }
        // Hide past packages
        if (package1Option) package1Option.style.display = 'none';
        if (package2Option) package2Option.style.display = 'none';
        // Reset if previous package was selected
        if (registrationSelect.value === 'package-1' || registrationSelect.value === 'package-2') {
            registrationSelect.value = 'package-3';
        }
    } else {
        // After May 31, 2026 - hide all registration options
        if (package1Option) package1Option.style.display = 'none';
        if (package2Option) package2Option.style.display = 'none';
        if (package3Option) package3Option.style.display = 'none';
        registrationSelect.value = '';
    }
    
    // Update total amount after option changes
    updateTotalAmount();
}

// Currency conversion rates (base: RM)
const currencyRates = {
    'RM': 1,
    'USD': 0.23, // 1 RM = 0.23 USD (approximate)
    'RMB': 1.67  // 1 RM = 1.67 RMB (approximate)
};

// Convert price from RM to selected currency
function convertCurrency(rmPrice, targetCurrency) {
    if (targetCurrency === 'RM') return rmPrice;
    return Math.round(rmPrice * currencyRates[targetCurrency]);
}

// Format currency display
function formatCurrency(amount, currency) {
    return `${currency}${amount}`;
}

// Update total amount calculation
function updateTotalAmount() {
    const registrationSelect = document.getElementById('registrationType');
    const registrationFeeElement = document.getElementById('registration-fee');
    const optionalFeeElement = document.getElementById('optional-fee');
    const totalAmountElement = document.getElementById('total-amount');
    const optionalBreakdown = document.getElementById('optional-breakdown');
    const currencySelect = document.getElementById('currency-select');
    
    // Get selected currency
    const selectedCurrency = currencySelect ? currencySelect.value : 'RM';
    
    // Get registration fee (in RM)
    let registrationFeeRM = 0;
    let registrationText = 'Not Selected';
    
    if (registrationSelect && registrationSelect.value && registrationSelect.value !== '') {
        const registrationPrices = {
            'package-1': { price: 390, text: 'Package 1 (RM390/USD90/RMB650)' },
            'package-2': { price: 430, text: 'Package 2 (RM430/USD115/RMB720)' },
            'package-3': { price: 480, text: 'Package 3 (RM480/USD130/RMB800)' }
        };
        
        const selectedPackage = registrationPrices[registrationSelect.value];
        if (selectedPackage) {
            registrationFeeRM = selectedPackage.price;
            registrationText = selectedPackage.text;
        }
    }
    
    // Get optional programs fee (in RM)
    let optionalFeeRM = 0;
    const optionalPrograms = [
        document.getElementById('poolsideParty'),
        document.getElementById('communityService'),
        document.getElementById('installationBanquet')
    ];
    
    optionalPrograms.forEach(select => {
        if (select && select.value && select.value !== '') {
            const selectedOption = select.options[select.selectedIndex];
            const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
            optionalFeeRM += price;
        }
    });
    
    // Convert to selected currency
    const registrationFee = convertCurrency(registrationFeeRM, selectedCurrency);
    const optionalFee = convertCurrency(optionalFeeRM, selectedCurrency);
    const total = registrationFee + optionalFee;
    
    // Update display
    if (registrationFeeElement) {
        registrationFeeElement.textContent = formatCurrency(registrationFee, selectedCurrency);
    }
    
    if (optionalFeeElement) {
        optionalFeeElement.textContent = formatCurrency(optionalFee, selectedCurrency);
    }
    
    if (optionalBreakdown) {
        optionalBreakdown.style.display = optionalFee > 0 ? 'flex' : 'none';
    }
    
    if (totalAmountElement) {
        totalAmountElement.textContent = formatCurrency(total, selectedCurrency);
    }
    
    // Debug logging
    console.log('Registration Fee:', registrationFee, 'Optional Fee:', optionalFee, 'Total:', total, 'Currency:', selectedCurrency);
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
        const response = await fetch('/.netlify/functions/registration-stats-neon');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                const data = result.data;
                // Transform the API response to match expected format
                const transformedData = {
                    counts: {
                        total: data.total || 0,
                        earlyBird: data.early_bird || 0,
                        recent24h: data.recent_24h || 0
                    },
                    earlyBird: {
                        available: data.early_bird_available || false,
                        remaining: data.early_bird_remaining || 0,
                        percentage: Math.round(((data.early_bird || 0) / (data.early_bird_limit || 100)) * 100)
                    }
                };
                console.log('Registration stats loaded:', transformedData);
                updateCounterDisplay(transformedData);
                return transformedData;
            }
        }
    } catch (error) {
        console.error('Registration stats API error:', error);
        console.log('Using demo data as fallback...');
        
        // Fallback to demo data
        const fallbackData = {
            counts: {
                total: 23,
                earlyBird: 15,
                recent24h: 3
            },
            earlyBird: {
                available: true,
                remaining: 85,
                percentage: 15
            }
        };
        updateCounterDisplay(fallbackData);
        return fallbackData;
    }
}

function updateCounterDisplay(data) {
    const totalCountEl = document.getElementById('totalCount');

    if (totalCountEl) totalCountEl.textContent = data.counts?.total || 0;

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
    // Initialize date-based pricing options
    updatePricingOptions();
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
    
    // Add event listener to currency select
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.addEventListener('change', updateTotalAmount);
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
                    showFormMessage('Please upload your payment slip.', 'error');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showFormMessage('File size must be less than 5MB.', 'error');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    return;
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                if (!allowedTypes.includes(file.type)) {
                    showFormMessage('Please upload a valid image (JPG, PNG) or PDF file.', 'error');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    return;
                }
                
                // Show upload status
                const uploadStatus = document.getElementById('upload-status');
                if (uploadStatus) {
                    uploadStatus.textContent = 'Processing file...';
                    uploadStatus.className = 'info';
                }
                
                // Convert file to base64
                let fileData;
                try {
                    fileData = await fileToBase64(file);
                    if (uploadStatus) {
                        uploadStatus.textContent = 'File processed successfully!';
                        uploadStatus.className = 'success';
                    }
                } catch (error) {
                    console.error('File processing error:', error);
                    showFormMessage('Error processing file. Please try again.', 'error');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    return;
                }
                
                // Collect form data and transform to match API expectations
                const formData = new FormData(registrationForm);
                const rawData = Object.fromEntries(formData.entries());
                
                // Parse full name into first and last name
                const fullName = rawData.fullName || '';
                const nameParts = fullName.trim().split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                
                // Calculate total amount
                const registrationPrices = {
                    'package-1': 390,
                    'package-2': 430,
                    'package-3': 480
                };
                const basePrice = registrationPrices[rawData.registrationType] || 0;
                
                // Calculate optional fees
                let optionalFee = 0;
                if (rawData.poolsideParty === 'poolside-party') optionalFee += 70;
                if (rawData.communityService === 'community-service') optionalFee += 70;
                if (rawData.installationBanquet === 'installation-banquet') optionalFee += 80;
                
                const totalAmount = basePrice + optionalFee;
                
                // Transform data to match API structure
                const registrationData = {
                    fullName: rawData.fullName, // Required by backend
                    firstName,
                    lastName,
                    email: rawData.email,
                    phone: rawData.phone,
                    residenceCountry: rawData.residenceCountry,
                    passportNric: rawData.passportNric,
                    gender: rawData.gender,
                    address: rawData.address,
                    clubName: rawData.clubName,
                    district: rawData.district,
                    otherDistrict: rawData.otherDistrict,
                    ppoasPosition: rawData.ppoasPosition,
                    districtCabinetPosition: rawData.districtCabinetPosition,
                    clubPosition: rawData.clubPosition,
                    positionInNgo: rawData.positionInNgo,
                    otherNgos: rawData.otherNgos,
                    registrationType: rawData.registrationType,
                    vegetarian: rawData.vegetarian === 'yes' ? 'yes' : 'no',
                    poolsideParty: rawData.poolsideParty === 'poolside-party' ? 'yes' : 'no',
                    communityService: rawData.communityService === 'community-service' ? 'yes' : 'no',
                    installationBanquet: rawData.installationBanquet === 'installation-banquet' ? 'yes' : 'no',
                    termsConditions: rawData.termsConditions === 'yes' ? 'yes' : 'no',
                    marketingEmails: rawData.marketingEmails === 'yes' ? 'yes' : 'no',
                    privacyPolicy: rawData.privacyPolicy === 'yes' ? 'yes' : 'no',
                    totalAmount: totalAmount,
                    paymentSlip: {
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        fileData: fileData
                    }
                }
                
                // Submit registration data
                const result = await submitRegistration(registrationData);
                
                if (result.success) {
                    let message = 'Registration successful! We will contact you soon.';
                    
                    // Handle warnings if present
                    if (result.hasWarnings && result.warnings) {
                        message += '\n\nWarnings:';
                        result.warnings.forEach(warning => {
                            message += `\n• ${warning}`;
                        });
                    }
                    
                    // Handle fallback mode
                    if (result.fallback) {
                        message += '\n\nNote: Registration was saved locally and will sync when the server is available.';
                    }
                    
                    showFormMessage(message, result.hasWarnings ? 'warning' : 'success');
                    registrationForm.reset();
                    updateTotalAmount(); // Reset the total calculation
                    
                    // Reset file preview
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
                    let errorMessage = result.message || 'Registration failed. Please try again.';
                    
                    // Add specific guidance based on error type
                    switch (result.errorType) {
                        case 'DUPLICATE_EMAIL':
                            errorMessage += '\n\nPlease use a different email address or contact support if you believe this is an error.';
                            break;
                        case 'VALIDATION_ERROR':
                            errorMessage += '\n\nPlease check all required fields and ensure they are filled correctly.';
                            break;
                        case 'UPLOAD_ERROR':
                            errorMessage += '\n\nThere was an issue uploading your payment slip. Please try with a different image file (JPG, PNG, or PDF under 5MB).';
                            break;
                        case 'DATABASE_ERROR':
                            errorMessage += '\n\nThere was a database issue. Please try again in a few moments.';
                            break;
                        case 'NETWORK_ERROR':
                            errorMessage += '\n\nPlease check your internet connection and try again.';
                            break;
                        case 'STORAGE_ERROR':
                            errorMessage += '\n\nLocal storage is not available. Please ensure your browser allows local storage and try again.';
                            break;
                        default:
                            errorMessage += '\n\nIf the problem persists, please contact support.';
                    }
                    
                    // Add details if available
                    if (result.details) {
                        console.error('Registration error details:', result.details);
                    }
                    
                    showFormMessage(errorMessage, 'error');
                }
                
            } catch (error) {
                console.error('Registration error:', error);
                showFormMessage('Registration failed. If the problem persists, please contact support.', 'error');
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
    
    // Phone validation removed - allow any text format
    
    return isValid;
}

// Submit registration to Netlify function
async function submitRegistration(data) {
    try {
        const response = await fetch('/.netlify/functions/register-neon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 409) {
                // Duplicate email - return the error directly
                return {
                    success: false,
                    message: result.message || 'Email already registered. Please use a different email address.',
                    errorType: 'DUPLICATE_EMAIL'
                };
            } else if (response.status === 400) {
                // Validation error - return the error directly
                return {
                    success: false,
                    message: result.message || 'Please fill in all required fields correctly.',
                    errorType: 'VALIDATION_ERROR'
                };
            } else if (response.status === 500) {
                // Server error - provide specific error handling
                return {
                    success: false,
                    message: result.message || 'Server error occurred. Please try again.',
                    errorType: result.error || 'SERVER_ERROR',
                    details: result.details
                };
            } else {
                // Other server errors - throw to trigger fallback
                throw new Error(result.message || 'Registration failed');
            }
        }

        // Success - also save to localStorage as backup
        const existingRegistrations = JSON.parse(localStorage.getItem('conventionRegistrations') || '[]');
        existingRegistrations.push(data);
        localStorage.setItem('conventionRegistrations', JSON.stringify(existingRegistrations));
        
        // Handle warnings if present
        if (result.warnings && result.warnings.length > 0) {
            console.warn('Registration completed with warnings:', result.warnings);
            result.hasWarnings = true;
        }
        
        return result;
    } catch (error) {
        console.error('API error, using localStorage fallback...', error);
        
        // Check if it's a network error or timeout
        const isNetworkError = error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('network');
        
        if (isNetworkError) {
            // Only use localStorage fallback for network/server errors, not validation errors
            try {
                const existingRegistrations = JSON.parse(localStorage.getItem('conventionRegistrations') || '[]');
                existingRegistrations.push(data);
                localStorage.setItem('conventionRegistrations', JSON.stringify(existingRegistrations));
                
                return {
                    success: true,
                    message: 'Registration saved locally due to network issues. Will sync when connection is restored.',
                    registrationId: data.registrationId,
                    fallback: true,
                    errorType: 'NETWORK_ERROR'
                };
            } catch (fallbackError) {
                console.error('LocalStorage fallback failed:', fallbackError);
                return {
                    success: false,
                    message: 'Registration failed due to network issues and local storage is unavailable. Please try again.',
                    errorType: 'STORAGE_ERROR'
                };
            }
        } else {
            // For other errors, don't use fallback
            return {
                success: false,
                message: error.message || 'Registration failed. Please try again.',
                errorType: 'UNKNOWN_ERROR'
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
        // Try to fetch from Netlify function first
        const response = await fetch('/.netlify/functions/admin-registrations-neon');
        if (response.ok) {
            const result = await response.json();
            console.log('API Registrations:', result.registrations);
            console.log('Statistics:', result);
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