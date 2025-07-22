const transporter = require('../config/email.config');
const TemplateEngine = require('../utils/templateEngine');
const { FRONTEND_URL, USER_EMAIL } = require('../config/env-variable');
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
            frontend_url: FRONTEND_URL,
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
      from: USER_EMAIL,
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
      from: USER_EMAIL,
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


async function sendEmailResetPassword(to, username, resetUrl, templateType = 'reset-password') {
    const subject = 'Restablecimiento de Contraseña - Smart Talent';
    
    try {
        const templateExists = await templateEngine.templateExists(templateType);
        if (!templateExists) {
            console.warn(`Plantilla ${templateType} no encontrada, usando 'reset-password' por defecto`);
            templateType = 'reset-password';
        }
        
        const variables = {
            username: username,
            email: to,
            reset_url: resetUrl,
            frontend_url: FRONTEND_URL,
        };
        
        // Renderizar plantilla
        const htmlContent = await templateEngine.render(templateType, variables);
        
        return await sendEmailHTML(to, subject, htmlContent);
    } catch (error) {
        console.error('Error al renderizar plantilla de email de reset:', error);
        throw new Error('Error al generar el email de restablecimiento');
    }
}

module.exports = {
    sendEmailCreateUser,
    sendEmailResetPassword,
    sendEmail,
    sendEmailHTML
};