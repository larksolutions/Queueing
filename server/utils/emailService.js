import nodemailer from 'nodemailer';

// Email configuration for institutional Gmail
// Note: You need to set up App Password in your Gmail account
// Go to: Google Account > Security > 2-Step Verification > App passwords
const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.INSTITUTIONAL_EMAIL || 'noreply@neu.edu.ph',
        pass: process.env.EMAIL_APP_PASSWORD || '' // Use App Password, not regular password
      }
    });
    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Send queue assignment notification
export const sendQueueAssignmentEmail = async (studentEmail, queueData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CICS Queueing System" <${process.env.INSTITUTIONAL_EMAIL || 'noreply@neu.edu.ph'}>`,
      to: studentEmail,
      subject: `Queue #${queueData.queueNumber} - Assigned to Faculty`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CICS Queueing System</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Queue Assignment Notification</h2>
            <p style="color: #4b5563; font-size: 16px;">Dear ${queueData.studentName},</p>
            <p style="color: #4b5563; font-size: 16px;">Your queue entry has been assigned to a faculty member:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 5px 0;"><strong>Queue Number:</strong> #${queueData.queueNumber}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${queueData.category}</p>
              <p style="margin: 5px 0;"><strong>Assigned Faculty:</strong> ${queueData.facultyName}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${queueData.status}</p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px;">Please be ready to proceed with your concern.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-queue" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View My Queue
              </a>
            </div>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              CICS Department Office | Monday-Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Assignment email sent to ${studentEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send queue completion notification
export const sendQueueCompletionEmail = async (studentEmail, queueData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CICS Queueing System" <${process.env.INSTITUTIONAL_EMAIL || 'noreply@neu.edu.ph'}>`,
      to: studentEmail,
      subject: `Queue #${queueData.queueNumber} - Completed`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CICS Queueing System</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Queue Completed</h2>
            <p style="color: #4b5563; font-size: 16px;">Dear ${queueData.studentName},</p>
            <p style="color: #4b5563; font-size: 16px;">Your queue has been marked as completed:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 5px 0;"><strong>Queue Number:</strong> #${queueData.queueNumber}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${queueData.category}</p>
              <p style="margin: 5px 0;"><strong>Faculty:</strong> ${queueData.facultyName}</p>
              ${queueData.remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${queueData.remarks}</p>` : ''}
            </div>
            
            <p style="color: #4b5563; font-size: 16px;">Thank you for using the CICS Queueing System!</p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              CICS Department Office | Monday-Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Completion email sent to ${studentEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send queue rescheduled notification
export const sendQueueRescheduledEmail = async (studentEmail, queueData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CICS Queueing System" <${process.env.INSTITUTIONAL_EMAIL || 'noreply@neu.edu.ph'}>`,
      to: studentEmail,
      subject: `Queue #${queueData.queueNumber} - Rescheduled`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CICS Queueing System</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Queue Rescheduled</h2>
            <p style="color: #4b5563; font-size: 16px;">Dear ${queueData.studentName},</p>
            <p style="color: #4b5563; font-size: 16px;">Your queue appointment has been rescheduled:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 5px 0;"><strong>Queue Number:</strong> #${queueData.queueNumber}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${queueData.category}</p>
              <p style="margin: 5px 0;"><strong>Faculty:</strong> ${queueData.facultyName}</p>
              ${queueData.remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${queueData.remarks}</p>` : ''}
            </div>
            
            <p style="color: #4b5563; font-size: 16px;">Please contact the office for your new schedule.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-queue" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View My Queue
              </a>
            </div>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              CICS Department Office | Monday-Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rescheduled email sent to ${studentEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send queue declined notification
export const sendQueueDeclinedEmail = async (studentEmail, queueData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CICS Queueing System" <${process.env.INSTITUTIONAL_EMAIL || 'noreply@neu.edu.ph'}>`,
      to: studentEmail,
      subject: `Queue #${queueData.queueNumber} - Declined`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CICS Queueing System</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Queue Declined</h2>
            <p style="color: #4b5563; font-size: 16px;">Dear ${queueData.studentName},</p>
            <p style="color: #4b5563; font-size: 16px;">Your queue request has been declined:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 5px 0;"><strong>Queue Number:</strong> #${queueData.queueNumber}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${queueData.category}</p>
              <p style="margin: 5px 0;"><strong>Faculty:</strong> ${queueData.facultyName}</p>
              ${queueData.remarks ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${queueData.remarks}</p>` : ''}
            </div>
            
            <p style="color: #4b5563; font-size: 16px;">If you have questions, please contact the CICS Department Office directly.</p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              CICS Department Office | Monday-Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Declined email sent to ${studentEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendQueueAssignmentEmail,
  sendQueueCompletionEmail,
  sendQueueRescheduledEmail,
  sendQueueDeclinedEmail
};
