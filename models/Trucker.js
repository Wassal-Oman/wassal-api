// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../settings');
const encrypt = require('../encryption');

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

// check database connection
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// customer schema
const Trucker = sequelize.define('truckers', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    phone: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        validate: {
            isNumeric: true,
            max: 8,
            min: 8,
            notEmpty: true
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT,
        defaultValue: 1
    }
}, {
    hooks: {
        beforeCreate: (user) => {
            return encrypt.hashData(user.password).then((hash) => {
                user.password = hash;
            }).catch((err) => {
                if(err) console.log(err);
            });
        }
    }
});

Trucker.prototype.validPassword = (password, hash) => {
    return encrypt.compareData(password, hash).then((val) => {
        return val;
    });
}

sequelize.sync({ force: true }).then(() => {
    console.log('Trucker Table Created!');
});

module.exports = Trucker;