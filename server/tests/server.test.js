const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const _ = require('lodash');


const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
    _id: new ObjectID('5abc7a8219b8a30fe82fca29'),
    text: 'test 1'
}, {
    text: 'test 2'
}];

beforeEach(done => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
})

describe('POST /todos', () => {
    it('should create new todo', done => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
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
                }).catch(e => {
                    done(e);
                })
            })
    })

    it('should not create todos with error data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) { done(e); }
                Todo.find().then(todos => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(e => {
                    done(e);
                })

            })
    })
})

describe('GET /todos', () => {
    it('should get todos', done => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.length).toBe(2);
            })
            .end(done);
    })
})

describe('GET /todos/:id', () => {
    it('should return todo doc', done => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
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
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-objectID', done => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('should return todo deleted', done => {
        request(app)
            .delete(`/todos/${todos[0]._id}`)
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

    it('should return 404 for non-obj', done => {
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should update todo', done => {
        var { _id } = todos[0];
        var text = 'this is test text';
        request(app)
            .patch(`/todos/${_id}`)
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
    it('should clear completedAt when todo is not completed', done => {
        var { _id } = todos[0];
        var text = 'this is test text';
        request(app)
            .patch(`/todos/${_id}`)
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
            .send({})
            .expect(404)
            .end(done)
    })

})