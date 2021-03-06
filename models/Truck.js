// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const Trucker = require('./Trucker');
const Type = require('./Type');

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

// truck schema
const Truck = sequelize.define('trucks', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    plate: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isAlphanumeric: true
        }
    },
    img: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

// create a foreign key relationship
Truck.belongsTo(Trucker);
Truck.belongsTo(Type);

// create truck table once application starts
sequelize.sync().then(() => {
    console.log('Truck Table Created!');
}).catch((err) => {
    console.log(err);
});

module.exports = Truck;