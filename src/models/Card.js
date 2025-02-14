import { DataTypes } from "sequelize";
import sequelize from "../database.js";
import User from "./User.js";

const Card = sequelize.define(
  "Card",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "Cards",
  }
);

User.hasMany(Card, { foreignKey: "userId" });
Card.belongsTo(User, { foreignKey: "userId" });

export default Card;
