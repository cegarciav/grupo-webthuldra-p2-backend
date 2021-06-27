module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      text: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      dealId: {
        type: Sequelize.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUUID: 4,
        },
      },
      sender: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true,
          isIn: [['customer', 'store']],
        },
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUUID: 4,
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('messages');
  },
};
