const Sequelize = require("sequelize");
const db = require("./db");
const Poll = require("./poll");

let Option = db.define("Option",{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    text: {
        type: Sequelize.STRING
    },
    votes: {
        type: Sequelize.INTEGER,
    },
    poll_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Poll,
            key: "id"
        }
    }
});


module.exports = Option;