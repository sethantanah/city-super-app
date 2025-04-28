// helpers.js
function formatPhoneNumber(phoneNumberString) {
    // Remove all non-digit characters
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    
    // US/Canada phone number format
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      const intlCode = match[1] ? '+1 ' : '';
      return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    
    // Return original if no formatting applies
    return phoneNumberString;
  }
  
  // Export the function
  module.exports = {
    formatPhoneNumber
  };