/**
 * Validation utilities for user registration and login
 */

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate mobile number (basic validation)
 */
function validateMobileNumber(mobile) {
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(mobile);
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  // At least 6 characters
  return password && password.length >= 6;
}

/**
 * Validate date of birth
 */
function validateDOB(dob) {
  const dobDate = new Date(dob);
  const today = new Date();
  // Check if date is valid and not in the future
  return dobDate instanceof Date && !isNaN(dobDate) && dobDate <= today;
}

/**
 * Validate gender
 */
function validateGender(gender) {
  const validGenders = ['male', 'female', 'other'];
  return validGenders.includes(gender?.toLowerCase());
}

/**
 * Validate registration data
 */
function validateRegistrationData(data) {
  const errors = [];

  // Trim all string fields
  const trimmedData = {
    name: data.name ? String(data.name).trim() : '',
    email: data.email ? String(data.email).trim() : '',
    mobile_number: data.mobile_number ? String(data.mobile_number).trim() : '',
    password: data.password ? String(data.password) : '',
    dob: data.dob ? String(data.dob).trim() : '',
    gender: data.gender ? String(data.gender).trim() : ''
  };

  if (!trimmedData.name || trimmedData.name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!trimmedData.email) {
    errors.push('Email is required');
  } else if (!validateEmail(trimmedData.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!trimmedData.mobile_number) {
    errors.push('Mobile number is required');
  } else if (!validateMobileNumber(trimmedData.mobile_number)) {
    errors.push('Please provide a valid mobile number (10-15 digits)');
  }

  if (!trimmedData.password) {
    errors.push('Password is required');
  } else if (!validatePassword(trimmedData.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!trimmedData.dob) {
    errors.push('Date of birth is required');
  } else if (!validateDOB(trimmedData.dob)) {
    errors.push('Please provide a valid date of birth');
  }

  if (!trimmedData.gender) {
    errors.push('Gender is required');
  } else if (!validateGender(trimmedData.gender)) {
    errors.push('Please provide a valid gender (male, female, or other)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData: trimmedData
  };
}

/**
 * Validate login data
 */
function validateLoginData(data) {
  const errors = [];

  if (!data.email && !data.mobile_number) {
    errors.push('Please provide either email or mobile number');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (data.mobile_number && !validateMobileNumber(data.mobile_number)) {
    errors.push('Please provide a valid mobile number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateEmail,
  validateMobileNumber,
  validatePassword,
  validateDOB,
  validateGender,
  validateRegistrationData,
  validateLoginData
};

