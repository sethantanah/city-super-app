const express = require('express');
const router = express.Router();
const { fetchJobs, getJobById, searchJobs, getFeaturedJobs } = require('../services/jobService');

// Job board home page
router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    const category = req.query.category || '';
    const type = req.query.type || '';
    const location = req.query.location || '';
    
    let jobs = [];
    
    if (query || category || type || location) {
      // Search with filters
      jobs = await searchJobs(query, { category, type, location });
    } else {
      // Get all jobs
      jobs = await fetchJobs();
    }
    
    // Get unique categories and job types for filter dropdowns
    const allJobs = await fetchJobs();
    const categories = [...new Set(allJobs.map(job => job.category))].filter(Boolean);
    const jobTypes = [...new Set(allJobs.map(job => job.type))].filter(Boolean);
    const locations = [...new Set(allJobs.map(job => job.location))].filter(Boolean);
    
    res.render('jobs/index', {
      title: 'Job Board | City Platform',
      jobs,
      query,
      category,
      type,
      location,
      categories,
      jobTypes,
      locations,
      activeTab: 'jobs'
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
router.get('/:id', async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    
    if (!job) {
      return res.status(404).render('error', { 
        message: 'Job not found',
        error: { status: 404 }
      });
    }
    
    // Get related jobs in the same category
    const allJobs = await fetchJobs();
    const relatedJobs = allJobs
      .filter(j => j.category === job.category && j.id !== job.id)
      .slice(0, 3);
    
    res.render('jobs/detail', {
      title: `${job.title} at ${job.company} | Job Board`,
      job,
      relatedJobs,
      activeTab: 'jobs'
    });
  } catch (error) {
    console.error('Error in job detail route:', error);
    res.status(500).render('error', { 
      message: 'Failed to load job details',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

// Post a new job page (we'll implement form handling later)
router.get('/post-job', (req, res) => {
  res.render('jobs/post', {
    title: 'Post a Job | City Platform',
    activeTab: 'jobs'
  });
});

module.exports = router;
