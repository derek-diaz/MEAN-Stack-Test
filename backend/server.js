const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');

const PORT = 3001;

const app = express();

app.use(cors());
const router = express();

const dbRoute = 'mongodb+srv://admin:#########@cluster0-zryxj.mongodb.net/test?retryWrites=true';

mongoose.connect(dbRoute, {useNewUrlParser: true});

let db = mongoose.connection;

db.once('open', () => console.log("Connected to DB!"));

db.on('error', console.error.bind(console, "MongoDB connection error:"));
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(logger('dev'));

function outputResolver(err, data){
    if (err){
        return {success: false, error: err};
    }
    if (data){
        return {success: true, data: data};
    }
    return {success: true};
}

router.get('/getData', (req, res) =>{
    Data.find((err, data) => {
       return res.json(outputResolver(err, data));
    });
});

router.post('/updateData', (req, res) =>{
    const {id, update} = req.body;
    Data.findByIdAndUpdate(id, update, (err) =>{
        return res.json(outputResolver(err));
    });
});

router.delete('/deleteData', (req, res) =>{
    const {id} = req.body;
    Data.findByIdAndRemove(id, (err) =>{
        if (err) return res.send(err);
            return res.json({ success: true });
    });
});

router.post('/putData', (req, res) =>{
    let data = new Data();

    const {id, message} = req.body;

    if ((!id && id !== 0) || !message){
        return res.json({
            sucess: false,
            error: 'Invald Input',
        });
    }

    data.message = message;
    data.id = id;

    data.save((err) =>{
        return res.json(outputResolver(err));
    });
});

app.use('/api', router);

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
