const Nexmo = require('nexmo');


const nexmo = new Nexmo({
  apiKey: 'd1c59fb2',
  apiSecret: '6dJBpFw3ndNr5HaO'
});

const from = 'Nexmo';
const to = '96896132329';
const text = 'Hello from Nexmo';

nexmo.message.sendSms(from, to, text);