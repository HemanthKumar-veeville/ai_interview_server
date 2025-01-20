const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Applicant = sequelize.define(
  "Applicant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    instanceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    careerGap: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resumeLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverLetterLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    conversations: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: "applicants",
  }
);

module.exports = Applicant;
