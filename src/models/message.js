const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.deal);
    }
  }

  message.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    dealId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUUID: 4,
      },
    },
    sender: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isIn: [['customer', 'store']],
      },
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUUID: 4,
      },
    },
  }, {
    sequelize,
    modelName: 'message',
  });
  return message;
};
