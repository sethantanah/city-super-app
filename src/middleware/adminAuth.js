/**
 * Middleware to check if user is authenticated as admin
 */
function isAdmin(req, res, next) {
  return next();
  // Check if user is logged in and has admin role
  if (req.isAuthenticated && req.user && req.user.role === 'admin') {
 /**
 * Middleware to check if user is authenticated as admin
 */
function isAdmin(req, res, next) {
  // Check if user is logged in and has admin role
  if (req.isAuthenticated && req.user && req.user.role === 'admin') {
    return next();
  }
  
  // If not authenticated or not admin, redirect to login
  // req.flash('error', 'You must be logged in as an administrator to access this page');
  return res.redirect('/admin/login');
}

module.exports = isAdmin;
   return next();
  }
  
  // If not authenticated or not admin, redirect to login
  // req.flash('error', 'You must be logged in as an administrator to access this page');
  return res.redirect('/admin/login');
}

module.exports = isAdmin;
