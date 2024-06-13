// controllers/jobs.js
const Job = require('../models/Job');
const parseValidationErrors = require('../util/parseValidationErr');
const { validationResult } = require('express-validator');

// Fetch all job listings belonging to the logged-in user
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ createdBy: req.user._id });
        res.render('jobs', { jobs });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to fetch job listings');
        res.redirect('/jobs');
    }
};

// Render the form to create a new job listing
const showNewJobForm = (req, res) => {
    res.render('job', { job: null }); // Pass null to indicate new job creation
};

// Render the form to edit a specific job listing
const showEditJobForm = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            req.flash('error', 'Job not found');
            return res.redirect('/jobs');
        }
        // Ensure the job belongs to the logged-in user
        if (job.createdBy.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/jobs');
        }
        res.render('job', { job });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to fetch job');
        res.redirect('/jobs');
    }
};

// Create a new job listing
const createJob = async (req, res) => {
    try {
        const { company, position, status } = req.body;
        const newJob = new Job({
            company,
            position,
            status,
            createdBy: req.user._id,
        });
        await newJob.save();
        req.flash('info', 'Job listing added successfully');
        res.redirect('/jobs');
    } catch (error) {
        if (error.name === 'ValidationError') {
            parseValidationErrors(error, req);
        } else {
            console.error(error);
            req.flash('error', 'Failed to add job listing');
        }
        res.redirect('/jobs/new');
    }
};

// Update an existing job listing
const updateJob = async (req, res) => {
    try {
        const { company, position, status } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) {
            req.flash('error', 'Job not found');
            return res.redirect('/jobs');
        }
        // Ensure the job belongs to the logged-in user
        if (job.createdBy.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/jobs');
        }
        job.company = company;
        job.position = position;
        job.status = status;
        await job.save();
        req.flash('info', 'Job listing updated successfully');
        res.redirect('/jobs');
    } catch (error) {
        if (error.name === 'ValidationError') {
            parseValidationErrors(error, req);
        } else {
            console.error(error);
            req.flash('error', 'Failed to update job listing');
        }
        res.redirect(`/jobs/edit/${req.params.id}`);
    }
};

// Delete an existing job listing
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            req.flash('error', 'Job not found');
            return res.redirect('/jobs');
        }
        // Ensure the job belongs to the logged-in user
        if (job.createdBy.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/jobs');
        }
        await job.delete();
        req.flash('info', 'Job listing deleted successfully');
        res.redirect('/jobs');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete job listing');
        res.redirect('/jobs');
    }
};

module.exports = {
    getAllJobs,
    showNewJobForm,
    showEditJobForm,
    createJob,
    updateJob,
    deleteJob,
};
