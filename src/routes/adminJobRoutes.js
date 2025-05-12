const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/adminAuth");
const {formatPhoneNumber} = require('../utils/helpers');

const {
  fetchJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  verifyJob,
  unverifyJob,
  getJobStats,
  getExpiredJobs,
  searchJobs,
  cleanupExpiredJobs,
} = require("../services/jobService");

// Apply admin middleware to all routes
router.use(isAdmin);

// Admin dashboard - Job management
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // Jobs per page
    const skip = (page - 1) * limit;
    const status = req.query.status || "all"; // all, verified, unverified, featured

    // Build query based on status filter
    const query = {};
    if (status === "verified") query.verified = true;
    if (status === "unverified") query.verified = false;
    if (status === "featured") query.featured = true;

    // Get jobs with pagination
    const jobs = await fetchJobs({
      limit,
      skip,
      sort: { postedDate: -1 },
      query,
    });

    // Get job stats
    const stats = await getJobStats();

    // Calculate total jobs for pagination based on filter
    let totalJobs;
    if (status === "verified") totalJobs = stats.verifiedCount;
    else if (status === "unverified")
      totalJobs = stats.totalCount - stats.verifiedCount;
    else if (status === "featured") totalJobs = stats.featuredCount;
    else totalJobs = stats.totalCount;

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    };

    res.render("admin/jobs/index", {
      title: "Job Management | Admin",
      jobs,
      stats,
      status,
      pagination,
      activeSection: "jobs",
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error("Error in admin jobs route:", error);
    //req.flash('error', 'Failed to load job listings');
    res.redirect("/admin/dashboard");
  }
});

// Admin dashboard - Job management
router.get("/search", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // Jobs per page
    const skip = (page - 1) * limit;
    const status = req.query.status || "all"; // all, verified, unverified, featured

    const query = req.query.q || "";
    const category = req.query.category || "";
    const type = req.query.type || "";
    const location = req.query.location || "";

    // Build query based on status filter
    const filters = {};
    if (status === "verified") filters.verified = true;
    if (status === "unverified") filters.verified = false;
    if (status === "featured") filters.featured = true;
    const options = { limit, skip, sort: { postedDate: -1 } };

    // Get jobs with pagination
    jobs = await searchJobs(query, filters, options);

    // Get job stats
    const stats = await getJobStats();

    // Calculate total jobs for pagination based on filter
    let totalJobs;
    if (status === "verified") totalJobs = stats.verifiedCount;
    else if (status === "unverified")
      totalJobs = stats.totalCount - stats.verifiedCount;
    else if (status === "featured") totalJobs = stats.featuredCount;
    else totalJobs = stats.totalCount;

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    };

    res.render("admin/jobs/index", {
      title: "Job Management | Admin",
      jobs,
      stats,
      status,
      pagination,
      query,
      activeSection: "jobs",
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error("Error in admin jobs route:", error);
    //req.flash('error', 'Failed to load job listings');
    res.redirect("/admin/dashboard");
  }
});

// Create new job form
router.get("/new", async (req, res) => {
  try {
    // Get job stats for categories and types
    const stats = await getJobStats();
    const categories = stats.categories.map((cat) => cat.name).filter(Boolean);
    const jobTypes = stats.types.map((type) => type.name).filter(Boolean);

    res.render("admin/jobs/new", {
      title: "Create New Job | Admin",
      categories,
      jobTypes,
      activeSection: "jobs",
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error("Error loading job creation form:", error);
    //req.flash('error', 'Failed to load job creation form');
    res.redirect("/admin/jobs");
  }
});

// Handle new job submission
router.post("/new", async (req, res) => {
  try {
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
      expiryDate,
      featured,
      verified,
    } = req.body;

    // Validate required fields
    if (!title || !company || !description) {
      //req.flash('error', 'Title, company, and description are required');
      return res.redirect("/admin/jobs/new");
    }

    // Create the job
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
      featured: featured === "on",
      verified: verified === "on",
    });

    //req.flash('success', 'Job created successfully');
    res.redirect(`/admin/jobs/edit/${job.jobId}`);
  } catch (error) {
    console.error("Error creating job:", error);
    //req.flash('error', 'Failed to create job');
    res.redirect("/admin/jobs/new");
  }
});

// Edit job form
router.get("/edit/:id", async (req, res) => {
  try {
    const job = await getJobById(req.params.id);

    if (!job) {
      // //req.flash('error', 'Job not found');
      return res.redirect("/admin/jobs");
    }

    // Get job stats for categories and types
    const stats = await getJobStats();
    const categories = stats.categories.map((cat) => cat.name).filter(Boolean);
    const jobTypes = stats.types.map((type) => type.name).filter(Boolean);

    res.render("admin/jobs/edit", {
      title: `Edit Job: ${job.title} | Admin`,
      job,
      categories,
      jobTypes,
      activeSection: "jobs",
      apiKey: process.env.OPENCAGE_API_KEY,
      formatPhoneNumber
    });
  } catch (error) {
    console.error("Error loading job edit form:", error);
    //req.flash('error', 'Failed to load job edit form');
    res.redirect("/admin/jobs");
  }
});

// Handle job update
router.post("/edit/:id", async (req, res) => {
  try {
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
      expiryDate,
      featured,
      verified,
    } = req.body;

    // Validate required fields
    if (!title || !company || !description) {
      //req.flash('error', 'Title, company, and description are required');
      return res.redirect(`/admin/jobs/edit/${req.params.id}`);
    }

    // Update the job
    const job = await updateJob(req.params.id, {
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
      featured: featured === "on",
      verified: verified === "on",
    });

    if (!job) {
      //req.flash('error', 'Job not found');
      return res.redirect("/admin/jobs");
    }

    //req.flash('success', 'Job updated successfully');
    res.redirect(`/admin/jobs/edit/${req.params.id}`);
  } catch (error) {
    console.error("Error updating job:", error);
    //req.flash('error', 'Failed to update job');
    res.redirect(`/admin/jobs/edit/${req.params.id}`);
  }
});

// Job deletion confirmation page
router.get("/delete/:id", async (req, res) => {
  try {
    const job = await getJobById(req.params.id);

    if (!job) {
      //req.flash('error', 'Job not found');
      return res.redirect("/admin/jobs");
    }

    res.render("admin/jobs/delete", {
      title: `Delete Job: ${job.title} | Admin`,
      job,
      activeSection: "jobs",
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error("Error loading job deletion page:", error);
    //req.flash('error', 'Failed to load job deletion page');
    res.redirect("/admin/jobs");
  }
});

// Handle job deletion
router.post("/delete/:id", async (req, res) => {
  try {
    const deleted = await deleteJob(req.params.id);

    if (!deleted) {
      //req.flash('error', 'Job not found');
      return res.redirect("/admin/jobs");
    }

    //req.flash('success', 'Job deleted successfully');
    res.redirect("/admin/jobs");
  } catch (error) {
    console.error("Error deleting job:", error);
    //req.flash('error', 'Failed to delete job');
    res.redirect("/admin/jobs");
  }
});

// Quick actions - Verify job
router.post("/verify/:id", async (req, res) => {
  try {
    const job = await verifyJob(req.params.id);

    if (!job) {
      //req.flash('error', 'Job not found');
    } else {
      //req.flash('success', 'Job verified successfully');
    }

    // Redirect back to the referring page or jobs list
    res.redirect(req.headers.referer || "/admin/jobs");
  } catch (error) {
    console.error("Error verifying job:", error);
    //req.flash('error', 'Failed to verify job');
    res.redirect("/admin/jobs");
  }
});

// Quick actions - Unverify job
router.post("/unverify/:id", async (req, res) => {
  try {
    const job = await unverifyJob(req.params.id);

    if (!job) {
      //req.flash('error', 'Job not found');
    } else {
      //req.flash('success', 'Job unverified successfully');
    }

    // Redirect back to the referring page or jobs list
    res.redirect(req.headers.referer || "/admin/jobs");
  } catch (error) {
    console.error("Error unverifying job:", error);
    //req.flash('error', 'Failed to unverify job');
    res.redirect("/admin/jobs");
  }
});

// Toggle featured status
router.post("/toggle-featured/:id", async (req, res) => {
  try {
    const job = await getJobById(req.params.id);

    if (!job) {
      //req.flash('error', 'Job not found');
      return res.redirect("/admin/jobs");
    }

    // Toggle featured status
    const updated = await updateJob(req.params.id, {
      featured: !job.featured,
    });

    //req.flash('success', updated.featured ? 'Job marked as featured' : 'Job removed from featured');

    // Redirect back to the referring page or jobs list
    res.redirect(req.headers.referer || "/admin/jobs");
  } catch (error) {
    console.error("Error toggling featured status:", error);
    //req.flash('error', 'Failed to update job');
    res.redirect("/admin/jobs");
  }
});

// View expired jobs
router.get("/expired", async (req, res) => {
  try {
    const expiredJobs = await getExpiredJobs();

    res.render("admin/jobs/expired", {
      title: "Expired Jobs | Admin",
      jobs: expiredJobs,
      activeSection: "jobs",
      apiKey: process.env.OPENCAGE_API_KEY
    });
  } catch (error) {
    console.error("Error loading expired jobs:", error);
    //req.flash('error', 'Failed to load expired jobs');
    res.redirect("/admin/jobs");
  }
});

// Clean up expired jobs
router.post("/cleanup-expired", async (req, res) => {
  try {
    const deletedCount = await cleanupExpiredJobs();

    //req.flash('success', `${deletedCount} expired jobs cleaned up successfully`);
    res.redirect("/admin/jobs/expired");
  } catch (error) {
    console.error("Error cleaning up expired jobs:", error);
    //req.flash('error', 'Failed to clean up expired jobs');
    res.redirect("/admin/jobs/expired");
  }
});

module.exports = router;
