const fs = require('fs').promises;
const path = require('path');

/**
 * Motor de plantillas para emails HTML
 */
class TemplateEngine {
    constructor() {
        this.templatesPath = path.join(__dirname, '../templates/emails');
    }

    /**
     * Lee una plantilla HTML desde archivo
     * @param {string} templateName - Nombre del archivo de plantilla (sin extensión)
     * @returns {Promise<string>} Contenido HTML de la plantilla
     */
    async loadTemplate(templateName) {
        try {
            const templatePath = path.join(this.templatesPath, `${templateName}.html`);
            const template = await fs.readFile(templatePath, 'utf8');
            return template;
        } catch (error) {
            throw new Error(`Error al cargar la plantilla ${templateName}: ${error.message}`);
        }
    }

    /**
     * Reemplaza variables en una plantilla
     * @param {string} template - Contenido HTML de la plantilla
     * @param {Object} variables - Objeto con variables a reemplazar
     * @returns {string} Plantilla con variables reemplazadas
     */
    replaceVariables(template, variables) {
        let result = template;
        
        // Reemplazar cada variable
        Object.keys(variables).forEach(key => {
            // Reemplazar tanto en mayúsculas como en minúsculas
            const placeholderUpper = `{{${key.toUpperCase()}}}`;
            const placeholderLower = `{{${key.toLowerCase()}}}`;
            const value = variables[key];
            
            result = result.replace(new RegExp(placeholderUpper, 'g'), value);
            result = result.replace(new RegExp(placeholderLower, 'g'), value);
        });
        
        return result;
    }

    /**
     * Renderiza una plantilla completa
     * @param {string} templateName - Nombre del archivo de plantilla
     * @param {Object} variables - Variables a reemplazar
     * @returns {Promise<string>} HTML renderizado
     */
    async render(templateName, variables) {
        try {
            // Cargar plantilla
            const template = await this.loadTemplate(templateName);
            
            // Reemplazar variables
            const rendered = this.replaceVariables(template, variables);
            
            return rendered;
        } catch (error) {
            throw new Error(`Error al renderizar plantilla ${templateName}: ${error.message}`);
        }
    }

    /**
     * Lista todas las plantillas disponibles
     * @returns {Promise<string[]>} Array con nombres de plantillas
     */
    async listTemplates() {
        try {
            const files = await fs.readdir(this.templatesPath);
            return files
                .filter(file => file.endsWith('.html'))
                .map(file => file.replace('.html', ''));
        } catch (error) {
            throw new Error(`Error al listar plantillas: ${error.message}`);
        }
    }

    /**
     * Verifica si una plantilla existe
     * @param {string} templateName - Nombre de la plantilla
     * @returns {Promise<boolean>} True si existe
     */
    async templateExists(templateName) {
        try {
            const templates = await this.listTemplates();
            return templates.includes(templateName);
        } catch (error) {
            return false;
        }
    }
}

module.exports = TemplateEngine;