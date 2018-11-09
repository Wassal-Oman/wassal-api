const bcrypt = require('bcrypt');

let pass = 'Wassal@123';
const saltRounds = 10;

function hp(pass) {
    bcrypt.hash(pass, saltRounds).then((hash) => {
        console.log(hash);
        checkUser(pass, hash);
    });
}

async function checkUser(password, hashedPass) {
    const match = await bcrypt.compare(password, hashedPass);
    console.log(match);
    if(match) {
        console.log('login successfull');
    }
}

hp(pass);