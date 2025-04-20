require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Contact Form Schema
const ContactSchema = new mongoose.Schema({
    name: String,
    surname: String,
    telephone: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', ContactSchema);

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, surname, telephone, message } = req.body;

        // Save to database
        const contact = new Contact({
            name,
            surname,
            telephone,
            message
        });
        await contact.save();

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'leuframy@yahoo.fr',
            subject: 'Nouveau message de contact - Site Web',
            text: `
                Nouveau message de contact:
                Nom: ${name}
                Prénom: ${surname}
                Téléphone: ${telephone}
                Message: ${message}
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Message envoyé avec succès' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 