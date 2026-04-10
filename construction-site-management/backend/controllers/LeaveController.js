const Leave = require('../models/Leave');

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.getAll();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave applications', details: error.message });
  }
};

exports.getLeavesByWorker = async (req, res) => {
  try {
    const leaves = await Leave.getByWorkerId(req.params.workerId);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch worker leaves', details: error.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply for leave', details: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.updateStatus(req.params.id, 'Approved', req.body.reviewerId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave application not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve leave', details: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.updateStatus(req.params.id, 'Rejected', req.body.reviewerId, req.body.reason);
    if (!leave) {
      return res.status(404).json({ error: 'Leave application not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject leave', details: error.message });
  }
};
