const nodemailer = require('nodemailer');
const { USER_EMAIL, PASS_EMAIL } = require('./env-variable');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER_EMAIL,
        pass: PASS_EMAIL
    }
});

module.exports = transporter;
