import nodemailer from 'nodemailer';

// Allow CORS for your domain (replace * with your actual domain in production if needed)
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_name, user_phone, user_email, service_interest, preferred_datetime, special_requests, form_origin } = req.body;

  // Email Transporter Configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Email Content
    const mailOptions = {
      from: `"${user_name}" <${process.env.SENDER_EMAIL}>`, 
      replyTo: user_email,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Booking Request: ${user_name} - ${service_interest}`,
      html: `
            <h2>New Appointment Request</h2>
            <p><strong>Source:</strong> ${form_origin}</p>
            <hr>
            <h3>Client Details</h3>
            <ul>
                <li><strong>Name:</strong> ${user_name}</li>
                <li><strong>Phone:</strong> ${user_phone}</li>
                <li><strong>Email:</strong> ${user_email}</li>
            </ul>
            <h3>Booking Details</h3>
            <ul>
                <li><strong>Service:</strong> ${service_interest}</li>
                <li><strong>Preferred Date:</strong> ${preferred_datetime}</li>
            </ul>
            <h3>Notes</h3>
            <p>${special_requests || 'None'}</p>
        `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Booking received successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.toString() });
  }
};

export default allowCors(handler);
