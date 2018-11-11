const bcrypt = require('bcrypt');
const settings = require('./settings');

// salt rounds
const saltRounds = settings.round;

module.exports = (text) => {

    console.log("cryptPassword" + text);

    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            // Encrypt password using bycrpt module
            if (err) return reject(err);

            bcrypt.hash(text, salt, (err, hash) => {
                if (err) return reject(err);
                return resolve(hash);
            });
        });
    });
}