
import dotenv from "dotenv";

dotenv.config();

/**
 * Parse CSV data from Google Sheets into job objects
 * @param {string} input - CSV data as string
 * @returns {Array} Array of job objects
 */
function parseJobData(input) {
    const lines = input.split("\n").slice(1); // Remove header row
    
    return lines.map((line) => {
      // Handle commas within quoted fields
      const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
      const fields = [];
      let match;
      
      while ((match = regex.exec(line))) {
        fields.push(match[1] ? match[1].replace(/""/g, '"') : match[2]);
      }
      
      const [
        id,
        title,
        company,
        location,
        type,
        category,
        description,
        requirements,
        salary,
        contactEmail,
        applicationUrl,
        postedDate,
        expiryDate,
        featured
      ] = fields;
      
      return {
        id,
        title,
        company,
        location,
        type,
        category,
        description,
        requirements,
        salary: salary || "Not specified",
        contactEmail,
        applicationUrl,
        postedDate: postedDate ? new Date(postedDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        featured: featured === "TRUE" || featured === "true" || featured === "1"
      };
    }).filter(job => job.id && job.title); // Filter out any rows with missing essential data
  }
  
  /**
   * Fetch job data from Google Sheets
   * @returns {Promise<Array>} Promise resolving to array of job objects
   */
  export async function fetchJobs() {
    try {
      const response = await fetch(process.env.JOB_SHEET_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job data: ${response.status} ${response.statusText}`);
      }
      
      const csvData = await response.text();
      return parseJobData(csvData);
    } catch (error) {
      console.error("Error fetching job data:", error);
      return [];
    }
  }
  
  /**
   * Get featured job listings
   * @param {number} limit - Maximum number of featured jobs to return
   * @returns {Promise<Array>} Promise resolving to array of featured job objects
   */
  export async function getFeaturedJobs(limit = 4) {
    const jobs = await fetchJobs();
    return jobs
      .filter(job => job.featured)
      .sort((a, b) => b.postedDate - a.postedDate)
      .slice(0, limit);
  }
  
  /**
   * Search jobs by query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Promise resolving to array of matching job objects
   */
  export async function searchJobs(query = "", filters = {}) {
    const jobs = await fetchJobs();
    
    return jobs.filter(job => {
      // Basic search through title, company, and description
      const matchesQuery = !query || 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase());
      
      // Apply additional filters
      const matchesCategory = !filters.category || job.category === filters.category;
      const matchesType = !filters.type || job.type === filters.type;
      const matchesLocation = !filters.location || job.location.includes(filters.location);
      
      return matchesQuery && matchesCategory && matchesType && matchesLocation;
    });
  }
  
  /**
   * Get job by ID
   * @param {string} id - Job ID
   * @returns {Promise<Object|null>} Promise resolving to job object or null if not found
   */
  export async function getJobById(id) {
    const jobs = await fetchJobs();
    return jobs.find(job => job.id === id) || null;
  }
  