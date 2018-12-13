// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../settings');
const Customer = require('./Customer');

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
    lfrom: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lto: {
        type: Sequelize.STRING,
        allowNull: false
    },
    latfrom: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    latto: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    lngfrom: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    lngto: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            max: 1
        }
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    reqdate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: '2018-01-01',
        validate: {
            isDate: true
        }
    },
    reqtime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
});

// create a foreign key relationship between Customer and Request tables
Request.belongsTo(Customer);

// create request table once application starts
sequelize.sync({ force: true }).then(() => {
    console.log('Request Table Created!');
});

module.exports = Request;