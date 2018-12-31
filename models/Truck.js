// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const Trucker = require('./Trucker');

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
    type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            max: 1
        }
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
    image: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
});

// create a foreign key relationship between Trucker and Truck tables
Truck.belongsTo(Trucker);

// create truck table once application starts
sequelize.sync().then(() => {
    console.log('Truck Table Created!');
}).catch((err) => {
    console.log(err);
});;

module.exports = Truck;