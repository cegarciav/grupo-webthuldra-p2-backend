module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('administrators', 'id',
    {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    }),

  down: async (queryInterface) => queryInterface.removeColumn('administrators', 'id'),
};
