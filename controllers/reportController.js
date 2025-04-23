const Report = require('../models/reportModel');
const { validateReportInput,validateUserUpdate } = require('../utils/validation');
const pool = require('../config/db');

const createReport = async (req, res) => {
  try {
    const { error } = validateReportInput(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const reportData = {
      ...req.body,
      user_id: req.user?.userId // From authentication middleware
    };

    const reportId = await Report.create(reportData);
    res.status(201).json({ 
      message: 'Report submitted successfully',
      reportId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.findAll();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserReports = async (req, res) => {
  try {
    const reports = await Report.findByUserId(req.user.userId);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
const getReportWithUserDetails = async (req, res) => {
    try {
      const report = await Report.findByIdWithUser(req.params.id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      const nm = `${report.first_name} ${report.last_name}`;      // Format the response
      const response = {
        report: {
          id: report.id,
          location: report.location,
          latitude: report.latitude,
          longitude: report.longitude,
          crime_type: report.crime_type,
          description: report.description,
          report_time: report.report_time,
          status: report.status,
          created_at: report.created_at
        },
        user: report.user_id ? {
          id: report.user_id,
          username:nm,
          email: report.email,
          phone: report.phone_number,
          national_id:report.national_id,
        } : null
      };
  
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const getMyFilteredReports = async (req, res) => {
    try {
      // Get query parameters
      const { status, sort } = req.query;
      const userId = req.user.userId;
      
      // Validate status if provided
      if (status && !['pending', 'under_investigation', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      // Validate sort if provided
      if (sort && !['newest', 'oldest'].includes(sort)) {
        return res.status(400).json({ error: 'Invalid sort value' });
      }
      
      const filters = {};
      if (status) filters.status = status;
      if (sort) filters.sort = sort;
      
      const reports = await Report.findByUserIdWithFilters(userId, filters);
      
      res.json({
        count: reports.length,
        reports
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const updateUser = async (req, res) => {
    try {
      // Validate input
      const { error } = validateUserUpdate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.details.map(d => d.message) 
        });
      }
  
      // Hash password if it's being updated
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
      // Update user
      const affectedRows = await Report.update(req.user.userId, req.body);
      console.log(affectedRows)
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Get updated user data to return
      const updatedUser = await Report.findById(req.user.userId);
      
      // Don't return password hash
      const { password, ...userData } = updatedUser;
      
      res.json({ 
        message: 'User updated successfully',
        user: userData
      });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      
      res.status(500).json({ error: 'Server error' });
    }
  };


  const searchRecords = async (req, res) => {
    try {
      const { crimeType, time, location, status } = req.query;
      
      let query = 'SELECT id, crime_type, location, report_time, status,description FROM crime_reports WHERE 1=1';
      const params = [];
      
      // Add filters based on query parameters
      if (crimeType) {
        query += ' AND crime_type LIKE ?';
        params.push(`%${crimeType}%`);
      }
      
      if (time) {
        query += ' AND DATE(report_time) = ?';
        params.push(time);
      }
      
      if (location) {
        query += ' AND location LIKE ?';
        params.push(`%${location}%`);
      }
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY report_time DESC';
      
      const [records] = await pool.query(query, params);
      
      res.json({
        count: records.length,
        records
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error during search' });
    }
  };
  const getRecordDetails = async (req, res) => {
    try {
      const recordId = req.params.id;
      
      const [rows] = await pool.query(`
        SELECT 
          r.*, 
          u.first_name, 
          u.last_name,
          u.phone_number
        FROM crime_reports r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `, [recordId]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      const record = rows[0];
      
      // Format response
      const response = {
        id: record.id,
        crime_type: record.crime_type,
        description: record.description,
        location: record.location,
        latitude: record.latitude,
        longitude: record.longitude,
        report_time: record.report_time,
        status: record.status,
        reporter: {
          name: `${record.first_name} ${record.last_name}`,
          contact: record.phone_number
        },
        evidence_proof: record.evidence_proof ? true : false
      };
      
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  const updateReportStatus = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { status } = req.body;
      const lawyerId = req.user.userId; // From auth middleware
  
      // Validate status
      const validStatuses = ['pending', 'under_investigation', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
  
      // Check if report exists and get current status
      const [report] = await pool.query(
        'SELECT * FROM crime_reports WHERE id = ?',
        [reportId]
      );
  
      if (report.length === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }
  
      // Update status
      const [result] = await pool.query(
        'UPDATE crime_reports SET status = ? WHERE id = ?',
        [status, reportId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'Failed to update status' });
      }
  
   
      res.json({
        message: 'تم تحديث الحالة بنجاح',
        reportId,
        newStatus: status
      });
  
    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({ error: 'فشل تحديث الحالة' });
    }
  };
  
module.exports = { 
  createReport, 
  getReports, 
  getReport,
  getUserReports,
  getReportWithUserDetails,
  getMyFilteredReports,
  updateUser,
  searchRecords,
  getRecordDetails,
  updateReportStatus
};
