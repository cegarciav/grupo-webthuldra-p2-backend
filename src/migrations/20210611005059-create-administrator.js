module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('administrators', {
      userId: {
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
        },
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('administrators');
  },
};
