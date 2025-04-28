import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: String,
  type: String,
  category: String,
  description: String,
  requirements: String,
  salary: {
    type: String,
    default: 'Not specified'
  },
  contactEmail: String,
  contactPhone: String,
  applicationUrl: String,
  postedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search functionality
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text'
});

const Job = mongoose.model('Jobs', jobSchema);

export default Job;
