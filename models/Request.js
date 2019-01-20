// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const Customer = require('./Customer');
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

// request schema
const Request = sequelize.define('requests', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    location: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    destination: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lat_from: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    lat_to: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    lng_from: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    lng_to: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    img: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    request_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: '2018-01-01',
        validate: {
            isDate: true
        }
    },
    request_time: {
        type: Sequelize.TIME,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
});

// create a foreign key relationships
Request.belongsTo(Customer);
Request.belongsTo(Type);

// create request table once application starts
sequelize.sync({ force: true }).then(() => {
    console.log('Request Table Created!');
}).catch((err) => {
    console.log(err);
});;

module.exports = Request;