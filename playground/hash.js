const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
    id: 15,
    mess:'test text'
}

var token =jwt.sign(data, 'hash-text');
console.log('token: ', token);
var tokenHash = jwt.verify(token, 'hash-text');
console.log('hash: ', tokenHash);
// var mess = 'this is a testing text';
// var hash = SHA256(mess).toString();
// console.log('mess : ', mess); 
// console.log('hash : ', hash); 

// var data = {
//     id:4
// }

// var token = {
//     data,
//     hash:SHA256(JSON.stringify(data)+'secret').toString()
// }

// var resultHash = SHA256(JSON.stringify(token.data) + 'secret').toString();

// if (resultHash === token.hash) {
//     console.log('Data was not change');
// } else {
//     console.log('Data was changed. Do not trust');
// }