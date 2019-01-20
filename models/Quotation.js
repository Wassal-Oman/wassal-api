// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const Trucker = require('./Trucker');
const Request = require('./Request');

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

// schema
const Quotation = sequelize.define('quotations', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cost: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    quotation_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: '2018-01-01',
        validate: {
            isDate: true
        }
    },
    quotation_time: {
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
Quotation.belongsTo(Request);
Quotation.belongsTo(Trucker);

// create rate table once application starts
sequelize.sync().then(() => {
    console.log('Quotations Table Created!');
}).catch((err) => {
    console.log(err);
});

module.exports = Quotation;