const mongoose = require('mongoose')
const JobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        maxlength: 50
    },
    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: 100
    },
    lastUpdatedSatus: {
        type: String,
        enum: ['applied', 'interview', 'declined', 'pending'],
        default: 'pending'
    },
}, { timestamps: true })

module.exports = mongoose.model('Application', JobSchema)