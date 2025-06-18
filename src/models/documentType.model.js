const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class DocumentType extends Model {
        static associate(models) {
        }
    }

    DocumentType.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'DocumentType'
    })

    return DocumentType;
}