const express = require('express');
const router = express.Router();
const { 
  fetchJobs, 
  getJobById, 
  searchJobs, 
  getFeaturedJobs,
  createJob,
  getJobsByCategory,
  getJobStats
} = require('../services/jobService');

const { getJSON } =  require("../services/storageService"); // Adjust

// Job board home page
router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    const category = req.query.category || '';
    const type = req.query.type || '';
    const location = req.query.location || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // Jobs per page
    const skip = (page - 1) * limit;
    
    let jobs = [];
    let localJobs = [];
    let totalJobs = 0;

    if (query || category || type || location) {
      // Search with filters
      const filters = { category, type, location, verified: true };
      const options = { limit, skip, sort: { postedDate: -1 } };
      
      jobs = await searchJobs(query, filters, options);
      
      // Get total count for pagination
      const allMatchingJobs = await searchJobs(query, filters);
      totalJobs = allMatchingJobs.length;
    } else {
      const cached = getJSON("locationData");
      if (cached) {
        const { country, state, county } = cached;
        localJobs = await searchJobs(`${state}`); 
        console.log(localJobs)
      }

      // Get all verified jobs with pagination
      jobs = await fetchJobs({ 
        limit, 
        skip, 
        sort: { postedDate: -1 } 
      });
      
      // Get job stats for total count
      const stats = await getJobStats();
      totalJobs = stats.verifiedCount;
    }
    
    // Get unique categories, job types, and locations for filter dropdowns
    const stats = await getJobStats();
    const categories = stats.categories.map(cat => cat.name).filter(Boolean);
    const jobTypes = stats.types.map(type => type.name).filter(Boolean);
    
    // For locations, we'll still need to get them from all jobs
    // This could be optimized with a dedicated aggregation in the future
    const allJobs = await fetchJobs({ limit: 1000 }); // Limit to a reasonable number
    const locations = [...new Set(allJobs.map(job => job.location))].filter(Boolean);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1
    };
    
    res.render('jobs/index', {
      title: 'Job Board | City Platform',
      jobs,
      localJobs,
      query,
      category,
      type,
      location,
      categories,
      jobTypes,
      locations,
      pagination,
      activeTab: 'jobs',
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error('Error in job board route:', error);
    res.status(500).render('error', { 
      message: 'Failed to load job listings',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

// Job details page
router.get('/details/:id', async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    
    if (!job) {
      return res.status(404).render('error', { 
        message: 'Job not found',
        error: { status: 404 }
      });
    }
    
    // Only show verified jobs (except for the current job which might be unverified)
    if (!job.verified) {
      // You might want to add authorization check here
      // to allow admins to view unverified jobs
      // For now, we'll just show a message
      req.flash('warning', 'You are viewing an unverified job listing.');
    }
    
    // Get related jobs in the same category
    const relatedJobs = await getJobsByCategory(job.category);
    
    // Filter out the current job and limit to 3 related jobs
    const filteredRelatedJobs = relatedJobs
      .filter(j => j.jobId !== job.jobId)
      .slice(0, 3);
    
    res.render('jobs/detail', {
      title: `${job.title} at ${job.company} | Job Board`,
      job,
      relatedJobs: filteredRelatedJobs,
      activeTab: 'jobs',
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error('Error in job detail route:', error);
    res.status(500).render('error', { 
      message: 'Failed to load job details',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

// Post a new job page (form display)
router.get('/post-job', (req, res) => {
  // Get categories and job types for the form dropdowns
  getJobStats().then(stats => {
    const categories = stats.categories.map(cat => cat.name).filter(Boolean);
    const jobTypes = stats.types.map(type => type.name).filter(Boolean);
    
    res.render('jobs/new', {
      title: 'Post a Job | City Platform',
      categories,
      jobTypes,
      activeTab: 'jobs',
      apiKey: process.env.OPENCAGE_API_KEY
    });
  }).catch(error => {
    console.error('Error loading job post form:', error);
    res.status(500).render('error', { 
      message: 'Failed to load job post form',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  });
});

// Handle job submission
router.post('/new', async (req, res) => {
  try {
    // Extract job data from request body
    const {
      title,
      company,
      location,
      type,
      category,
      description,
      requirements,
      salary,
      contactEmail,
      contactPhone,
      applicationUrl,
      expiryDate
    } = req.body;
    
    // Validate required fields
    if (!title || !company || !description) {
      return res.status(400).render('jobs/post', {
        title: 'Post a Job | City Platform',
        error: 'Title, company, and description are required',
        formData: req.body,
        activeTab: 'jobs',
        apiKey: process.env.OPENCAGE_API_KEY
      });
    }
    
    // Create the job (unverified by default)
    const job = await createJob({
      title,
      company,
      location,
      type,
      category,
      description,
      requirements,
      salary,
      contactEmail,
      contactPhone,
      applicationUrl,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      featured: false,
      verified: false // Jobs are unverified by default
    });
    
    // Redirect to success page or job detail
    req.flash('success', 'Your job posting has been submitted and is pending review.');
    res.redirect(`/jobs/details/${job.id}`);
  } catch (error) {
    console.error('Error posting job:', error);
    
    // Get categories and job types for the form dropdowns (in case of error)
    const stats = await getJobStats();
    const categories = stats.categories.map(cat => cat.name).filter(Boolean);
    const jobTypes = stats.types.map(type => type.name).filter(Boolean);
    
    res.status(500).render('jobs/post', {
      title: 'Post a Job | City Platform',
      error: 'Failed to post job. Please try again.',
      formData: req.body,
      categories,
      jobTypes,
      activeTab: 'jobs',
      apiKey: process.env.OPENCAGE_API_KEY
    });
  }
});

// Featured jobs page
router.get('/featured', async (req, res) => {
  try {
    const featuredJobs = await getFeaturedJobs(10); // Get up to 10 featured jobs
    
    res.render('jobs/featured', {
      title: 'Featured Jobs | City Platform',
      jobs: featuredJobs,
      activeTab: 'jobs',
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error('Error loading featured jobs:', error);
    res.status(500).render('error', { 
      message: 'Failed to load featured jobs',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

// Jobs by category page
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const jobs = await getJobsByCategory(category);
    
    res.render('jobs/category', {
      title: `${category} Jobs | City Platform`,
      category,
      jobs,
      activeTab: 'jobs',
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error('Error loading jobs by category:', error);
    res.status(500).render('error', { 
      message: 'Failed to load jobs by category',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});



module.exports = router;
