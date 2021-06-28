module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
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
      grade: {
        type: Sequelize.INTEGER,
        validate: {
          min: 0,
          max: 5,
        },
      },
      reviewerId: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'NO ACTION',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      storeId: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'NO ACTION',
        references: {
          model: 'stores',
          key: 'id',
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
    await queryInterface.dropTable('comments');
  },
};
