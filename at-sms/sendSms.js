const AfricasTalking = require('africastalking');

//const number = document.getElementById('number').value;

// TODO: Initialize Africa's Talking
const africastalking = AfricasTalking({
    apiKey: '1c3a5f48c0197bd367ba63435b0794bb396b110bc7d44db26aac03d52efaf657', 
    username: 'sandbox'
  });



module.exports = async function sendSMS() {
    
    // TODO: Send message
    try {
        const result=await africastalking.SMS.send({
          to: "+2347043710895", 
          message: 'Hey This is from TeleHealthNg....',
          from: '38054'
        });
        console.log(result);
      } catch(ex) {
        console.error(ex);
      }

};