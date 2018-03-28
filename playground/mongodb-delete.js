const {MongoClient} = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'TodoApp';

MongoClient.connect(url, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db(dbName);
  
    db.collection('Todos').deleteOne({text:'Something to do 23 '}).then((results) => {
        console.log(JSON.stringify(results, undefined, 2));
    }, (err) => {
        console.log('Unable to fetch todos', err);
        })
    //deleteMany
    //findOneAndDelete
    client.close();
});