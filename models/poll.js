const Sequelize = require("sequelize");
const db = require("./db");
const User = require("./user");
const Option = require("./option");

let Poll = db.define("Poll",{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
    },
    description: {
        type: Sequelize.TEXT
    },
    publicVote: {
        type: Sequelize.BOOLEAN
    },
    user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User,
            key: "username"
        }
    }
});

Poll.belongsTo(User,{foreignKey: "user_id"});
Poll.hasMany(Option,{foreignKey: "poll_id"});

module.exports = Poll;