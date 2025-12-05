const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use Gmail, SendGrid, or any SMTP service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD // Your email password or app password
  }
});

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - HomeFlow',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link:</p>
        <p style="color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">HomeFlow - Smart Household Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send task assignment email
const sendTaskAssignmentEmail = async (userEmail, userName, task) => {
  const taskUrl = `${process.env.FRONTEND_URL}/dashboard`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `New Task Assigned: ${task.title} - HomeFlow`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">🏠 New Task Assigned!</h2>
        <p>Hi ${userName},</p>
        <p>You've been assigned a new task:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${task.title}</h3>
          ${task.description ? `<p style="margin: 10px 0; color: #666;">${task.description}</p>` : ''}
          <p style="margin: 10px 0;">
            <strong>Priority:</strong> <span style="color: ${getPriorityColor(task.priority)}; text-transform: capitalize;">${task.priority}</span>
          </p>
          <p style="margin: 10px 0;">
            <strong>Category:</strong> ${task.category}
          </p>
          <p style="margin: 10px 0;">
            <strong>Points:</strong> ${task.points} pts
          </p>
          ${task.dueDate ? `<p style="margin: 10px 0;"><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
        </div>
        
        <a href="${taskUrl}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Task</a>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">HomeFlow - Smart Household Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Task assignment email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    // Don't throw - we don't want to fail task creation if email fails
  }
};

// Send task completion notification
const sendTaskCompletionEmail = async (userEmail, userName, task, completedByName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Task Completed: ${task.title} - HomeFlow`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4caf50;">✅ Task Completed!</h2>
        <p>Hi ${userName},</p>
        <p><strong>${completedByName}</strong> has completed the task:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${task.title}</h3>
        </div>
        
        <p>Great teamwork! 🎉</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">HomeFlow - Smart Household Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Task completion email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending task completion email:', error);
  }
};

// Helper function
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#f44336';
    case 'medium': return '#ff9800';
    case 'low': return '#4caf50';
    default: return '#9e9e9e';
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendTaskAssignmentEmail,
  sendTaskCompletionEmail
};