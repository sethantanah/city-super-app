import dotenv from 'dotenv';
import Job from '../models/job.js';

dotenv.config();

/**
 * Generate a unique job ID
 * @returns {string} A unique job ID
 */
function generateJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Fetch all jobs from MongoDB
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} Promise resolving to array of job objects
 */
export async function fetchJobs(options = {}) {
  try {
    const { limit = 100, skip = 0, sort = { postedDate: -1 }, query } = options;
    
    return await Job.find(query || {verified: true})
      
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error("Error fetching jobs from MongoDB:", error);
    throw error;
  }
}

/**
 * Get featured job listings
 * @param {number} limit - Maximum number of featured jobs to return
 * @returns {Promise<Array>} Promise resolving to array of featured job objects
 */
export async function getFeaturedJobs(limit = 4) {
  try {
    return await Job.find({ featured: true, verified: true })
      .sort({ postedDate: -1 })
      .limit(limit);
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    throw error;
  }
}

/**
 * Search jobs by query
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} Promise resolving to array of matching job objects
 */
export async function searchJobs(query = "", filters = {}, options = {}) {
  try {
    const { limit = 100, skip = 0, sort = { postedDate: -1 } } = options;
    
    // Build the query object
    const queryObject = {};
    
    // Add text search if query is provided
    if (query) {
      queryObject.$text = { $search: query };
    }
    
    // Add filters
    if (filters.category) {
      queryObject.category = filters.category;
    }
    
    if (filters.type) {
      queryObject.type = filters.type;
    }
    
    if (filters.location) {
      queryObject.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters.verified !== undefined) {
      queryObject.verified = filters.verified;
    }
    
    return await Job.find(queryObject)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error("Error searching jobs:", error);
    throw error;
  }
}

/**
 * Get job by ID
 * @param {string} id - Job ID
 * @returns {Promise<Object|null>} Promise resolving to job object or null if not found
 */
export async function getJobById(id) {
  try {
    return await Job.findOne({ _id: id });
  } catch (error) {
    console.error(`Error fetching job with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new job
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Promise resolving to created job object
 */
export async function createJob(jobData) {
  try {
    // Generate a unique job ID if not provided
    if (!jobData.jobId) {
      jobData.jobId = generateJobId();
    }
    
    // Set default values if not provided
    if (jobData.postedDate === undefined) {
      jobData.postedDate = new Date();
    }
    
    if (jobData.salary === undefined) {
      jobData.salary = "Not specified";
    }
    
    // Create the job
    const job = new Job(jobData);
    await job.save();
    
    return job;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

/**
 * Update an existing job
 * @param {string} id - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object|null>} Promise resolving to updated job object or null if not found
 */
export async function updateJob(id, jobData) {
  try {
    // Find and update the job
    const job = await Job.findOneAndUpdate(
      { jobId: id },
      { $set: jobData },
      { new: true, runValidators: true }
    );
    
    return job;
  } catch (error) {
    console.error(`Error updating job with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a job
 * @param {string} id - Job ID
 * @returns {Promise<boolean>} Promise resolving to true if job was deleted, false otherwise
 */
export async function deleteJob(id) {
  try {
    const result = await Job.deleteOne({ jobId: id });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting job with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Verify a job
 * @param {string} id - Job ID
 * @returns {Promise<Object|null>} Promise resolving to updated job object or null if not found
 */
export async function verifyJob(id) {
  try {
    return await updateJob(id, { verified: true });
  } catch (error) {
    console.error(`Error verifying job with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Unverify a job
 * @param {string} id - Job ID
 * @returns {Promise<Object|null>} Promise resolving to updated job object or null if not found
 */
export async function unverifyJob(id) {
  try {
    return await updateJob(id, { verified: false });
  } catch (error) {
    console.error(`Error unverifying job with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get job statistics
 * @returns {Promise<Object>} Promise resolving to job statistics
 */
export async function getJobStats() {
  try {
    const [totalCount, verifiedCount, featuredCount, categoryCounts, typeCounts] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ verified: true }),
      Job.countDocuments({ featured: true }),
      Job.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Job.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    return {
      totalCount,
      verifiedCount,
      featuredCount,
      categories: categoryCounts.map(item => ({ name: item._id, count: item.count })),
      types: typeCounts.map(item => ({ name: item._id, count: item.count }))
    };
  } catch (error) {
    console.error("Error getting job statistics:", error);
    throw error;
  }
}

/**
 * Bulk create jobs
 * @param {Array} jobsData - Array of job data objects
 * @returns {Promise<Array>} Promise resolving to array of created job objects
 */
export async function bulkCreateJobs(jobsData) {
  try {
    // Prepare jobs with IDs and default values
    const preparedJobs = jobsData.map(jobData => ({
      ...jobData,
      jobId: jobData.jobId || generateJobId(),
      postedDate: jobData.postedDate || new Date(),
      salary: jobData.salary || "Not specified"
    }));
    
    // Insert jobs
    const result = await Job.insertMany(preparedJobs);
    return result;
  } catch (error) {
    console.error("Error bulk creating jobs:", error);
    throw error;
  }
}

/**
 * Get recent jobs
 * @param {number} limit - Maximum number of recent jobs to return
 * @returns {Promise<Array>} Promise resolving to array of recent job objects
 */
export async function getRecentJobs(limit = 10) {
  try {
    return await Job.find({ verified: true })
      .sort({ postedDate: -1 })
      .limit(limit);
  } catch (error) {
    console.error("Error fetching recent jobs:", error);
    throw error;
  }
}

/**
 * Get jobs by company
 * @param {string} company - Company name
 * @returns {Promise<Array>} Promise resolving to array of job objects for the company
 */
export async function getJobsByCompany(company) {
  try {
    return await Job.find({ 
      company: { $regex: new RegExp(company, 'i') },
      verified: true 
    }).sort({ postedDate: -1 });
  } catch (error) {
    console.error(`Error fetching jobs for company ${company}:`, error);
    throw error;
  }
}

/**
 * Get jobs by category
 * @param {string} category - Job category
 * @returns {Promise<Array>} Promise resolving to array of job objects in the category
 */
export async function getJobsByCategory(category) {
  try {
    return await Job.find({ 
      category: category,
      verified: true 
    }).sort({ postedDate: -1 });
  } catch (error) {
    console.error(`Error fetching jobs for category ${category}:`, error);
    throw error;
  }
}

/**
 * Get expired jobs
 * @returns {Promise<Array>} Promise resolving to array of expired job objects
 */
export async function getExpiredJobs() {
  try {
    const now = new Date();
    return await Job.find({
      expiryDate: { $lt: now, $ne: null }
    }).sort({ expiryDate: -1 });
  } catch (error) {
    console.error("Error fetching expired jobs:", error);
    throw error;
  }
}

/**
 * Clean up expired jobs (delete jobs that expired more than 30 days ago)
 * @returns {Promise<number>} Promise resolving to number of deleted jobs
 */
export async function cleanupExpiredJobs() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Job.deleteMany({
      expiryDate: { $lt: thirtyDaysAgo, $ne: null }
    });
    
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up expired jobs:", error);
    throw error;
  }
}
