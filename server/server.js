require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse JSON bodies

// Email Transporter Configuration (Generic SMTP)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test the connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('Server is ready, but email connection failed:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

// POST endpoint to handle form submissions
app.post('/api/send-email', async (req, res) => {
    const { user_name, user_phone, user_email, service_interest, preferred_datetime, special_requests, form_origin } = req.body;

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
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Booking received successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
