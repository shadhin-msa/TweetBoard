
var spawn = require('child_process').exec;

spawn('twitter-proxy');
spawn('http-server');

console.log('Server running on http://localhost:8080');
console.log('Request the Twitter API using: http://localhost:7890/1.1/statuses/user_timeline.json\?count\=30\&screen_name\=makeschool');

var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Set static path
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    console.log('GET /')
    res.render('index.html');
    
});

app.post('/', function (req, res) {
    console.log('POST /');
    console.dir(req.body);

    var obj = JSON.parse(fs.readFileSync('public/settings.json', 'utf8'));
    obj.count = req.body.count;
    obj.fromDate = req.body.fromDate;

    if (req.body.order[0] != '' || req.body.order[1] != '' || req.body.order[2] != '') {

        var tmp = [];
        tmp.push(obj.uScrName[parseInt(req.body.order[0])]);
        tmp.push(obj.uScrName[parseInt(req.body.order[1])]);
        tmp.push(obj.uScrName[parseInt(req.body.order[2])]);
        obj.uScrName = tmp;
    }


    jsonData = JSON.stringify(obj)

    fs.writeFile("public/settings.json", jsonData, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });

    res.redirect('/');
});

port = 8080;
app.listen(port);
console.log('Listening at http://localhost:' + port)