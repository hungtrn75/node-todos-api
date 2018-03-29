const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');


Todo.findByIdAndRemove('5abd0a5806261510f0902cea').then(todo => {
    console.log(todo);
})