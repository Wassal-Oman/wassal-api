// import needed libraries
const Sequelize = require('sequelize');
const settings = require('./settings');
const bcrypt = require('bcrypt');

// import database connection details
const conn = settings.connection;

// create connection
const sequelize = new Sequelize(conn.database, conn.user, conn.password, {
    host: conn.host,
    dialect: conn.dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

// ***** define database schemas ***** //

// user model / schema
var User = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSalt(10);
        user.password = bcrypt.hashSync(user.password, salt);
      }
    }
});

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = User;