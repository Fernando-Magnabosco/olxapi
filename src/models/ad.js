const { model } = require("mongoose");
const { Sequelize, DataTypes } = require("sequelize");
const db = require("../db");

const modelSchema = db.define(
    "Ad",
    {
        _id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },

        idUser: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        state: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: "State",
                key: "_id",
            },
        },

        category: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: "Category",
                key: "_id",
            },
        },

        dateCreated: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },

        priceNegotiable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        views: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },

    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = modelSchema;
