const { MongoClient, ObjectID } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'TodoApp';

MongoClient.connect(url, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db(dbName);

    db.collection('User').findOneAndUpdate({
        _id: new ObjectID('5abc1c050465ce199ce44dd2')
    }, {
            $set: {
                name: 'hungtrn75'
            },
            $inc: {
                age: 1
            }
        }, {
            returnOriginal: false
        }).then(result => {
            console.log(result);
        })
    client.close();
});