const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.store, { as: 'store', foreignKey: 'storeId' });
      this.belongsToMany(models.deal, { through: models.purchase });
    }
  }

  product.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    unit: {
      type: DataTypes.STRING,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUUID: 4,
      },
    },
    picture: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};
