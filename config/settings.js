const connection = {
    host: "31.170.166.179",
    user: "u327976002_uat",
    password: "Wassal@123",
    database: "u327976002_uat",
    dialect: "mysql"
};

const saltRound = 10;

const SMS_CREDENTAILS = {
    API_KEY: "d1c59fb2",
    API_SECRET: "6dJBpFw3ndNr5HaO",
    SENDER: "Wassal - وصل"
};

const EMAIL_CREDENTAILS = {
    SMTP_HOST: "mx1.hostinger.com",
    SMTP_PORT: 587,
    AUTH: {
        user: "info@wassal.net",
        pass: "Wassal@123"
    },
    TLS: {
        rejectUnauthorized: false
    }
};

const SUPER_ADMIN = {
    NAME: 'SUPER ADMIN',
    EMAIL: 'wassal6616@gmail.com',
    PASSWORD: 'Wassal@123$',
    PHONE: '96132329',
    STATUS: 2
};

const JWT_SECRET_KEY = 'API_JWT_SECRET';

module.exports.connection = connection;
module.exports.round = saltRound;
module.exports.SMS_CREDENTAILS = SMS_CREDENTAILS;
module.exports.EMAIL_CREDENTAILS = EMAIL_CREDENTAILS;
module.exports.SUPER_ADMIN = SUPER_ADMIN;
module.exports.JWT_SECRET_KEY = JWT_SECRET_KEY;