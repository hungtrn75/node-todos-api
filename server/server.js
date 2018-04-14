require('./../config/config');

const express = require('express');
const { ObjectID } = require('mongodb');

const _ = require('lodash');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/todos', authenticate, async (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    })
    try {
        const doc = await todo.save();
        res.send(doc);
    } catch (e) {
        res.status(400).send(e);
    }

    // todo.save().then(doc => {
    //     res.send(doc);
    // }, e => {
    //     res.status(400).send(e);
    // })
})

app.get('/todos', authenticate, async (req, res) => {
    try {
        const todos = await Todo.find({ _creator: req.user._id });
        res.send(todos);
    } catch (e) {
        res.status(400).send(e);
    }

    // Todo.find({
    //     _creator: req.user._id
    // }).then(todos => {
    //     res.send(todos);
    // }, e => {
    //     res.status(400).send(e);
    // })
})

app.get('/todos/:id', authenticate, async (req, res) => {
    var { id } = req.params;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    try {
        const todo = await Todo.findOne({
            _id: id,
            _creator: req.user._id
        });
        if (!todo) {
            return res.status(404).send();
        }
        res.send(todo);
    } catch (e) {
        res.status(400).send(e);
    }

    // Todo.findOne({
    //     _id: id,
    //     _creator: req.user._id
    // }).then(todo => {
    //     if (!todo) {
    //         return res.status(404).send();
    //     }
    //     res.send(todo);
    // }, e => {
    //     res.status(400).send(e);
    // })
})

app.delete('/todos/:id', authenticate, async (req, res) => {
    var { id } = req.params;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    try {
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        });
        if (!todo) {
            return res.status(404).send();
        }
        res.send(todo);
    } catch (e) {
        res.status(400).send(e);
    }

    // Todo.findOneAndRemove({
    //     _id: id,
    //     _creator: req.user._id
    // }).then(todo => {
    //     if (!todo) {
    //         return res.status(404).send();
    //     }
    //     res.send(todo);
    // }, e => {
    //     res.status(400).send(e);
    // })
})

app.patch('/todos/:id', authenticate, async (req, res) => {
    try {
        var { id } = req.params;
        var body = _.pick(req.body, ['text', 'completed']);
        if (!ObjectID.isValid(id)) {
            return res.status(404).send();
        }
        if (_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime();
        } else {
            body.completed = false;
            body.completedAt = null;
        }

        const todo = await Todo.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, { $set: body }, { new: true });
        if (!todo) {
            return res.status(404).send();
        }
        res.send(todo);
    } catch (e) {
        res.status(400).send();
    }
    // Todo.findOneAndUpdate({
    //     _id: id,
    //     _creator: req.user._id
    // }, { $set: body }, { new: true }).then(todo => {
    //     if (!todo) {
    //         return res.status(404).send();
    //     }
    //     res.send(todo);
    // }).catch(e => res.status(400).send())
})

// POST /users
app.post('/users', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        if (_.has(e, 'code')) {
            res.status(400).send({
                'code': e.code,
                'errmsg': e.errmsg
            })
        } else {
            res.status(400).send(e);
        }
    }
    // user.save().then(() => {
    //     return user.generateAuthToken();
    // }).then(token => {
    //     res.header('x-auth', token).send(user);
    // }).catch(e => {
    //     if (_.has(e, 'code')) {
    //         res.status(400).send({
    //             'code': e.code,
    //             'errmsg': e.errmsg
    //         })
    //     } else {
    //         res.status(400).send(e);
    //     }
    // })
})

app.post('/users/login', async (req, res) => {
    try {
        var body = _.pick(req.body, ['email', 'password']);
        let user = await User.findByCredentials(body.email, body.password);
        let token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
    // User.findByCredentials(body.email, body.password).then(user => {
    //     return user.generateAuthToken().then(token => {
    //         res.header('x-auth', token).send(user);
    //     })
    // }).catch(e => {
    //     res.status(400).send(e);
    // })
})

//GET /users/me
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
})

//DELETE /users/me/token
app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
})

app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
})

module.exports = { app };