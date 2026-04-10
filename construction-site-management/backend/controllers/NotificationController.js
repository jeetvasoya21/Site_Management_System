const Notification = require('../models/Notification');

class NotificationController {
  static async getNotifications(req, res) {
    try {
      const { userId } = req.params;
      const notifications = await Notification.getByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  static async getAllNotifications(req, res) {
    try {
      const notifications = await Notification.getAll();
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  static async createNotification(req, res) {
    try {
      const notificationData = req.body;
      const newNotification = await Notification.create(notificationData);
      res.status(201).json(newNotification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  static async markRead(req, res) {
    try {
      const { id } = req.params;
      const updated = await Notification.markRead(id);
      if (!updated) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error marking notification read:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  }

  static async markAllRead(req, res) {
    try {
      const { userId } = req.params;
      const updated = await Notification.markAllRead(userId);
      res.json({ updated: updated.length });
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Notification.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
}

module.exports = NotificationController;
