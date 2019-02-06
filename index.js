const express = require('express');
const app = express();
const port = 3000;

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ messages: [] }).write();

const axios = require('axios');
const uuidv4 = require('uuid/v4');

const ngrok = require('ngrok');
let url;
(async function () {
    try {
        url = await ngrok.connect(port);
        console.log('Your ngrok URL is: ', url);
    } catch (error) {
        console.error(error);
    }
})();

app.use(express.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
    return res.render('index.ejs', { messages });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));