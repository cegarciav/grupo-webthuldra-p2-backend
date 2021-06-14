const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { as: 'owner' });
      this.hasMany(models.product, { foreignKey: 'storeId' });
    }
  }

  store.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUUID: 4,
      },
    },
  }, {
    sequelize,
    modelName: 'store',
  });
  return store;
};
