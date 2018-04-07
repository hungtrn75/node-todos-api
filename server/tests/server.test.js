const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const _ = require('lodash');


const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');

const { todos, users, populateTodos, populateUsers } = require('./../tests/seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('should create new todo', done => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
            .set('x-auth',users[0].tokens[0].token)
            .send({ text })
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find({ text }).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            })
    })

    it('should not create todos with error data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth',users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) { done(e); }
                Todo.find().then(todos => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(e => done(e));

            })
    })
})

describe('GET /todos', () => {
    it('should get todos', done => {
        request(app)
            .get('/todos')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.length).toBe(1);
            })
            .end(done);
    })
})

describe('GET /todos/:id', () => {
    it('should return todo doc', done => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(todos[0].text);
            })
            .end(done);
    })

    it('should return 404 if todo not found', done => {
        var testid = new ObjectID();
        request(app)
            .get(`/todos/${testid}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-objectID', done => {
        request(app)
            .get('/todos/123abc')
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 if todo not found', done => {
        let id = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('should remove todo', done => {
        request(app)
            .delete(`/todos/${todos[0]._id}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    done();
                }
                Todo.findById(todos[0]._id).then(todo => {
                    expect(todo).toBeFalsy();
                    done();
                }).catch(e => done(e))
            })
    })

    it('should not remove todo with other auth token', done => {
        request(app)
            .delete(`/todos/${todos[0]._id}`)
            .set('x-auth',users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    done();
                }
                Todo.findById(todos[0]._id).then(todo => {
                    expect(todo).toBeTruthy();
                    done();
                }).catch(e => done(e))
            })
    })

    it('should return 404 for non-obj', done => {
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 for invalid-obj', done => {
        var id = new ObjectID();
        request(app)
            .delete('/todos/test1234')
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should update todo', done => {
        var { _id } = todos[0];
        var text = 'this is test text';
        request(app)
            .patch(`/todos/${_id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
            .send({
                completed: true,
                text
            })
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
                expect(res.body.completed).toBe(true);
                expect(typeof res.body.completedAt).toBe('number');
            })
            .end(done)
    })

    it('should not update with other invalid-todo', done => {
        var { _id } = todos[0];
        var text = 'this is test text';
        request(app)
            .patch(`/todos/${_id.toHexString()}`)
            .set('x-auth',users[1].tokens[0].token)
            .send({
                completed: true,
                text
            })
            .expect(404)
            .end(done)
    })

    it('should clear completedAt when todo is not completed', done => {
        var { _id } = todos[0];
        var text = 'this is test text';
        request(app)
            .patch(`/todos/${_id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
            .send({
                completed: false,
                text
            })
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
                expect(res.body.completed).toBe(false);
                expect(res.body.completedAt).toBeFalsy();
            })
            .end(done)
    })

    it('should be false when todo is not found', done => {
        var _id = new ObjectID();
        request(app)
            .patch(`/todos/${_id}`)
            .set('x-auth',users[0].tokens[0].token)
            .send({})
            .expect(404)
            .end(done)
    })
})

describe('GET /users/me', () => {
    it('should return user if authenticated', done => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    })

    it('should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    })
})

describe('POST /users', () => {
    it('should create a user', done => {
        var email = 'example@example.com';
        var password = 'example';
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end(err => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email }).then(user => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch(e => done(e));
            })
    })

    it('should return 400 if invalid user', done => {
        var email = 'hung';
        var pass = 'trn75';
        request(app)
            .post('/users')
            .send({ email, pass })
            .expect(400)
            .end(done);
    })

    it('should not create a user if in use', done => {
        var email = 'hungtrn75@test.com';
        var password = '123456';
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email }).then(user => {
                    expect(user.email).toBe(email);
                    done();
                }).catch(e => done(e));
            })
    })
})

describe('POST /users/login', (req, res) => {
    it('should login user and return auth token', done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password:users[1].password
            })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then(user => {
                    expect(user.tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    })
                    done()
                }).catch(e => done(e));
            })
    })

    it('should reject invalid login', done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password + '1'
            })
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).toBeFalsy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then(user => {
                    expect(user.tokens.length).toBe(1);
                    done()
                }).catch(e => done(e));
            })
    })
})

describe('DELETE /user/me/token', () => {
    it('should remove auth token on logout', done => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    res.status(400).send(err);
                }

                User.findById(users[0]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(e => done(e));
            })
    })
})