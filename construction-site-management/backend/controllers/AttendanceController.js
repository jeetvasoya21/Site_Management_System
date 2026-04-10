const Attendance = require('../models/Attendance');

class AttendanceController {
  static async getAllAttendance(req, res) {
    try {
      const attendance = await Attendance.getAll();
      res.json(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  }

  static async getAttendanceById(req, res) {
    try {
      const { id } = req.params;
      const attendance = await Attendance.getById(id);
      if (!attendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      res.json(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  }

  static async getAttendanceByProject(req, res) {
    try {
      const { projectId } = req.params;
      const attendance = await Attendance.getByProjectId(projectId);
      res.json(attendance);
    } catch (error) {
      console.error('Error fetching attendance by project:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  }

  static async getAttendanceByWorker(req, res) {
    try {
      const { workerId } = req.params;
      const attendance = await Attendance.getByWorkerId(workerId);
      res.json(attendance);
    } catch (error) {
      console.error('Error fetching attendance by worker:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  }

  static async createAttendance(req, res) {
    try {
      const attendanceData = req.body;
      const Attendance = require('../models/Attendance');
      const newAttendance = await Attendance.create(attendanceData);

      // Recalculate Worker Salary based on total attendance
      const allAttendance = await Attendance.getByWorkerId(newAttendance.worker_id);
      const totalSalary = allAttendance.reduce((sum, att) => sum + Number(att.labor_cost || 0), 0);
      
      const Worker = require('../models/Worker');
      await Worker.update(newAttendance.worker_id, { salary: totalSalary });

      res.status(201).json(newAttendance);
    } catch (error) {
      console.error('Error creating attendance:', error);
      res.status(500).json({ error: 'Failed to create/update attendance' });
    }
  }

  static async updateAttendance(req, res) {
    try {
      const { id } = req.params;
      const attendanceData = req.body;
      const updatedAttendance = await Attendance.update(id, attendanceData);
      if (!updatedAttendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      res.json(updatedAttendance);
    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).json({ error: 'Failed to update attendance' });
    }
  }

  static async deleteAttendance(req, res) {
    try {
      const { id } = req.params;
      const deletedAttendance = await Attendance.delete(id);
      if (!deletedAttendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({ error: 'Failed to delete attendance' });
    }
  }
}

module.exports = AttendanceController;