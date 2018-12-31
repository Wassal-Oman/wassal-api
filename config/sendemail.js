const nodemailer = require('nodemailer');
const settings = require('./settings');

const config = settings.EMAIL_CREDENTAILS;

let transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false,
    auth: config.AUTH,
    tls: config.TLS
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Wassal" <info@wassal.net>',
    to: 'optimist_gm@hotmail.com',
    subject: 'Hello From NodeJS',
    text: 'Hello world?',
    html: '<b>Hello From NodeJS</b>'
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
});