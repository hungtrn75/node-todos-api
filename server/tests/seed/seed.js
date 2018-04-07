const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

var userOneId = new ObjectID();
var userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'hungtrn75@test.com',
    password: 'test123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'hungtrn76@test.com',
    password: 'testabc',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userTwoId, access: 'auth' }, 'abc123').toString()
    }]
}];

const todos = [{
    _id: new ObjectID('5abc7a8219b8a30fe82fca29'),
    text: 'test 1',
    _creator: userOneId
}, {
    text: 'test 2',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}];


const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
}

module.exports = { todos, users, populateTodos, populateUsers };