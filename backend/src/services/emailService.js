const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'homeschoolmoore3@gmail.com';
const FROM_NAME = 'HomeFlow';

// Send task assignment email
const sendTaskAssignmentEmail = async (toEmail, toName, task) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email');
    return;
  }

  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: '✅ New Task Assigned to You!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #667eea; margin-top: 0;">🎯 New Task Assigned!</h1>
          
          <p style="font-size: 16px; color: #333;">Hi ${toName},</p>
          
          <p style="font-size: 16px; color: #333;">You've been assigned a new task:</p>
          
          <div style="background: #f7f7f7; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333;">${task.title}</h2>
            ${task.description ? `<p style="color: #666;">${task.description}</p>` : ''}
            <p style="margin: 10px 0;">
              <strong>Category:</strong> ${task.category}<br>
              <strong>Priority:</strong> <span style="color: ${getPriorityColor(task.priority)};">${task.priority}</span><br>
              <strong>Points:</strong> 🏆 ${task.points}
            </p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View Task
          </a>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Complete this task to earn ${task.points} points! 🎉
          </p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Task assignment email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }
  }
};

// Send task completion email
const sendTaskCompletionEmail = async (toEmail, toName, task, completedByName) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email');
    return;
  }

  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: '🎉 Task Completed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #11998e; margin-top: 0;">✨ Task Completed!</h1>
          
          <p style="font-size: 16px; color: #333;">Hi ${toName},</p>
          
          <p style="font-size: 16px; color: #333;">Great news! <strong>${completedByName}</strong> just completed a task:</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #11998e; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333;">✅ ${task.title}</h2>
            ${task.description ? `<p style="color: #666;">${task.description}</p>` : ''}
            <p style="margin: 10px 0;">
              <strong>Points Earned:</strong> 🏆 ${task.points}<br>
              <strong>Completed by:</strong> ${completedByName}
            </p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}" 
             style="display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View Dashboard
          </a>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Keep up the great work! 🚀
          </p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Task completion email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending task completion email:', error);
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }
  }
};

// Send password reset email
const sendPasswordResetEmail = async (toEmail, toName, resetToken) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email');
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password?token=${resetToken}`;

  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: '🔐 Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #667eea; margin-top: 0;">🔑 Password Reset Request</h1>
          
          <p style="font-size: 16px; color: #333;">Hi ${toName},</p>
          
          <p style="font-size: 16px; color: #333;">You requested to reset your password. Click the button below to create a new password:</p>
          
          <a href="${resetUrl}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Password reset email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }
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
  sendTaskAssignmentEmail,
  sendTaskCompletionEmail,
  sendPasswordResetEmail
};