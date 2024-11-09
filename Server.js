// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config(); // Load environment variables from .env file

// Initialize Express app
const app = express();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON requests
app.use(bodyParser.json());

// CORS Middleware (optional, if needed for cross-origin requests)
const cors = require("cors");
app.use(cors());

// Route to serve the contact.html file from the public folder
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// POST route to handle form submission from the contact form
app.post("/api/contact", async (req, res) => {
    // Extract data from the request body
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Configure nodemailer transporter for sending email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL, // Recipient from .env
            subject: `${subject} - from ${name} <${email}>`,
            text: message,
            html: `<p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Subject:</strong> ${subject}</p>
                   <p><strong>Message:</strong><br>${message}</p>`,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        // Response to client if successful
        res.status(200).json({
            message: "Message sent successfully!",
            info: info.response,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
