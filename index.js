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
    const messages = db.get('messages')
        .value();

    return res.render('index.ejs', { messages });
});

app.post('/messages', async (req, res) => {
    const id = uuidv4();
    const content = req.body.message;
    const paid = false;
    const createdAt = Date.now();

    db.get('messages')
        .push({ id, content, paid, createdAt })
        .write();

    axios.post('https://dev-api.opennode.co/v1/charges', {
        amount: 1,
        description: 'Message to TABConf',
        order_id: id,
    }, { headers: { Authorization: '95164e77-7feb-43f1-9fb7-f5c1149d84dc' } })
        .then(response => {
            res.render('payment.ejs', { payreq: response.data.data.lightning_invoice.payreq });
        })
        .catch(error => console.log(error.response.data));
});

app.listen(port, () => console.log(`App listening on port ${port}!`));