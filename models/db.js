const Sequelize = require("sequelize");

const sequelize = new Sequelize("opinio","opinio","opinio",{
    dialect: "sqlite",
    host: "localhost", 
    operatorsAliases: false,
    storage: "opinio.sqlite"
});

module.exports = sequelize;