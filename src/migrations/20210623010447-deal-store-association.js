module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('deals', 'storeId',
    {
      type: Sequelize.UUID,
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
      references: {
        model: 'stores',
        key: 'id',
      },
    }),

  down: async (queryInterface) => queryInterface.removeColumn('deals', 'storeId'),
};
