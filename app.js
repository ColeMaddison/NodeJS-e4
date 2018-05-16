'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const mime = require("mime-types");
const moment = require("moment");

let htmlPath = path.join(__dirname, 'index.html');
// file for the post req data
let postFileName = 'log_post_file.txt';
const postFilePath = path.join(__dirname, postFileName);

// log file for req - res info
let logFileName = 'log_file.txt';
const logFilePath = path.join(__dirname, logFileName);

// save data in postfilename via streams
let logging = (file, data) => {
    let writeStream = fs.createWriteStream(file, {'flags': 'a'});
    writeStream.write(data);
    writeStream.end();
};

// checking whether the post log exists if not - create it - prevents doubling the first string in the file('start the log file')
if(fs.existsSync(postFilePath)){
    console.log('Post log file is ready.');
} else{
    logging(postFileName, '');
}

// checking whether the log exists if not - create it - prevents doubling the first string in the file('start the log file')
if(fs.existsSync(logFilePath)){
    console.log('Log file is ready.');
} else{
    logging(logFileName, 'Start of the log file:\n');
}

// allowed content types for post reqs
const allowedContentTypes = [
    "application/x-www-form-urlencoded",
    "application/json"
];

// the image base
let imagesLinks = [
    '/the-beast.gif',
    '/the-cat.jpg',
    '/the-monster.png'
];

const PORT = process.env.PORT || 3000;

const server = http.createServer();

server.on('request', (req, res)=>{

    // response info obj - use for logging res url, user agent, total response handle time - info for all requests
    let connectionInfo = {};
    // get date of the request
    connectionInfo.startDate = new Date();
    connectionInfo.userAgent = req.headers['user-agent'];

    // get starting second of the request
    let mom1 = new Date().getSeconds();    
    
    //get req params of the url
    const reqParams = url.parse(req.url, true);
    let origin = reqParams.pathname;

    // log req start to log file
    logging(logFileName, `\nSending start time: ${connectionInfo.startDate.toLocaleTimeString()} ${connectionInfo.startDate.toLocaleDateString()}\n`);

    // send html page when get req
    if(req.method === 'GET' && origin === '/'){
        res.writeHead(200, {'Content-type': 'text/html'});

        // manage index file read with streams
        let indexRead = fs.createReadStream(htmlPath);
        indexRead.pipe(res);


    } else if(req.method === 'POST'){
        let data = '';
        // save data in a file, whem got post req (file is new on every server start)
        if(allowedContentTypes.includes(req.headers['content-type'])){
            req.on('data', (chunk)=>{
                data += chunk;
            });
            req.on('end', ()=>{
                let obj;
                if(req.headers['content-type'] === "application/json") obj = JSON.parse(data);
                else obj = querystring.parse(data);

                logging(postFileName, `\n${JSON.stringify(obj)}`);
                res.end("Data saved");
            });
        }
    } else if(req.method === "GET" && origin === "/postdata"){
        let strToBeSent = {};
        let rs = fs.readFile(postFileName, 'utf8', (err, data) => {
            if(err) throw err;
            strToBeSent.data = [];
            let buff = data.slice(1).split('\n')

            buff.forEach(item => {
                // convert str to json and push to arr to send in res
                strToBeSent.data.push(JSON.parse(item));
            });

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(strToBeSent));
        });
    } else if(req.method === "GET" && imagesLinks.includes(origin)){
        // route for images, if image is in base, get the image mime type, read the image and send it to res
        let beastMime = mime.contentType(path.join(__dirname, origin.slice(1)).split(';')[0]); 
        let beastStream = fs.createReadStream(path.join(__dirname, origin.slice(1)));
        res.writeHead(200, {"Content-Type": beastMime});
        beastStream.pipe(res);
    } else{
        res.writeHead(404);
        res.end('Not found!');
    }   
    let finishDate = new Date();
    connectionInfo.finishDate = finishDate;
    // get finishing second of the request
    let mom2 = new Date().getMilliseconds();
    connectionInfo.timeTaken = mom2 - mom1;

    logging(logFileName, `Sending finish time: ${connectionInfo.finishDate.toLocaleTimeString()} ${connectionInfo.finishDate.toLocaleDateString()}\n`);

    logging(logFileName, `Sending took ${connectionInfo.timeTaken/1000}s. and finished with status code ${res.statusCode} from user-agent: ${connectionInfo.userAgent}\n\n`);
});

server.listen(PORT, ()=>{
    console.log(`Server running on port: ${PORT}`);
});

