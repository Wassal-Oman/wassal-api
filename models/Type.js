// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');

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
const Type = sequelize.define('types', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// create truck table once application starts
sequelize.sync({ force: true }).then(() => {
    console.log('Types Table Created!');

    // insert truck types
    Type.create({
        type: 'Pickup'
    });

    Type.create({
        type: 'Medium Truck'
    });

    Type.create({
        type: '3.5 Tons'
    });
}).catch((err) => {
    console.log(err);
});

module.exports = Type;