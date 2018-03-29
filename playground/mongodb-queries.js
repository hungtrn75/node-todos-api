const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

User.findById('5abc4e5a0482551658e69da8').then(user => {
    console.log(user);
}, e => {
    console.log(e);
})

