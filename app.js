'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');

let htmlPath = path.join(__dirname, 'index.html');
// file for the post req data
let postFileName = 'log_file.txt';
const logFilePath = path.join(__dirname, postFileName);

// save data in postfilename via streams
let logging = (file, data) => {
    let writeStream = fs.createWriteStream(file, {'flags': 'a'});
    writeStream.write(data);
    writeStream.end();
};

// checking whether the log exists if not - create it - prevents doubling the first string in the file('start the log file')
if(fs.existsSync(postFilePath)){
    console.log('Log file is ready.');
} else{
    logging(logFileName, 'Start of the log file:\n');
}

// allowed content types for post reqs
const allowedContentTypes = [
    "application/x-www-form-urlencoded",
    "application/json"
];

const PORT = process.env.PORT || 3000;

const server = http.createServer();

server.on('request', (req, res)=>{
    // send html page when get req
    if(req.method === 'GET' && req.url === '/'){
        res.writeHead(200, {'Content-type': 'text/html'});
        fs.readFile(htmlPath, (err, data)=>{
            if(err){
                res.writeHead(404);
                res.write('Not found!');
            } else {
                res.write(data);
            }
        });
    } else if(req.method === 'POST'){
        // save data in a file, whem got post req (file is new on every server start)
        if(allowedContentTypes.includes(re.headers['content-type'])){
            
        }
    } else{
        res.writeHead(404);
        req.end('Not found!');
    }
});

server.listen(PORT, ()=>{
    console.log(`Server running on port: ${PORT}`);
});
