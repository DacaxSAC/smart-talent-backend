const { Entity, User, Role } = require('../models');

const EntityService = {
  async createEntityWithUser(data) {
    const {
      type,
      documentNumber,
      firstName,
      paternalSurname,
      maternalSurname,
      address,
      phone,
      businessName,
      email
    } = data;

    // Verificar si la entidad ya existe por documento
    const entityExists = await Entity.findOne({ where: { documentNumber } });
    if (entityExists) {
      throw new Error('Ya existe una entidad con este número de documento');
    }

    // Verificar si ya existe un usuario con ese email
    const userExists = await User.findOne({
      where: { email, active: true }
    });
    if (userExists) {
      throw new Error('Ya existe un usuario con este email');
    }

    // Crear nueva entidad
    const entity = await Entity.create({
      type,
      documentNumber,
      firstName,
      paternalSurname,
      maternalSurname,
      businessName,
      address,
      phone,
      active: true
    });

    // Obtener el rol USER
    const userRole = await Role.findOne({ where: { name: 'USER' } });
    if (!userRole) {
      throw new Error('Error al asignar rol: Rol USER no encontrado');
    }

    // Crear usuario asociado
    const user = await User.create({
      username: type === 'NATURAL'
        ? `${firstName} ${paternalSurname} ${maternalSurname}`
        : businessName,
      email,
      password: documentNumber, // La contraseña será el DNI o RUC
      active: true,
      entityId: entity.id
    });

    // Asignar rol al usuario
    await user.setRoles([userRole]);

    return {
      entity,
      user: {
        email: user.email,
        username: user.username
      }
    };
  }
};

module.exports = EntityService;