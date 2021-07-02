module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('administrators', 'updatedAt',
    {
      allowNull: false,
      type: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.removeColumn('administrators', 'updatedAt'),
};
