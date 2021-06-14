const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class deal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { as: 'customer' });
      this.belongsToMany(models.product, { through: models.purchase });
    }
  }

  deal.init({
    status: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isIn: [['abierto', 'completado', 'rechazado']],
      },
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUUID: 4,
      },
    },
  }, {
    sequelize,
    modelName: 'deal',
  });
  return deal;
};
