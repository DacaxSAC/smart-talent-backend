const transporter = require('../config/email.config');
const TemplateEngine = require('../utils/templateEngine');
require('dotenv').config();

const templateEngine = new TemplateEngine();

async function sendEmailCreateUser(to, password, templateType = 'welcome') {
    const subject = 'Bienvenido a Smart Talent - Tus Credenciales de Acceso';
    
    try {
        const templateExists = await templateEngine.templateExists(templateType);
        console.log(templateExists);
        if (!templateExists) {
            console.warn(`Plantilla ${templateType} no encontrada, usando 'welcome' por defecto`);
            templateType = 'welcome';
        }
        
        const variables = {
            email: to,
            password: password,
            frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000'
        };
        console.log(variables);
        // Renderizar plantilla
        const htmlContent = await templateEngine.render(templateType, variables);
        console.log(htmlContent);
        
        return await sendEmailHTML(to, subject, htmlContent);
    } catch (error) {
        console.error('Error al renderizar plantilla de email:', error);
        throw new Error('Error al generar el email de bienvenida');
    }
}

async function sendEmail(to, subject, text) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
}

async function sendEmailHTML(to, subject, html) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
}


module.exports = sendEmailCreateUser;