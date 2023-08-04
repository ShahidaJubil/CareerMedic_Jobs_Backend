// Define UserJob schema for storing job application data
const mongoose = require('mongoose');

const userJobsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  appliedOn: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Scheduled', 'Rejected', 'Selected']
  }
});

module.exports = mongoose.model('JobApp', userJobsSchema);
