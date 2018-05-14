'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');

let htmlPath = path.join(__dirname, 'index.html');
// file for the post req data
let postFileName = 'log_post_file.txt';
const postFilePath = path.join(__dirname, postFileName);

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
    logging(postFileName, '');
}

// allowed content types for post reqs
const allowedContentTypes = [
    "application/x-www-form-urlencoded",
    "application/json"
];

const PORT = process.env.PORT || 3000;

const server = http.createServer();

server.on('request', (req, res)=>{
    //get req params of the url
    const reqParams = url.parse(req.url, true);
    // send html page when get req
    if(req.method === 'GET' && reqParams.pathname === '/'){
        res.writeHead(200, {'Content-type': 'text/html'});
        fs.readFile(htmlPath, (err, data)=>{
            if(err){
                res.writeHead(404);
                res.write('Not found!');
            } else {
                res.write(data);
                res.end();
            }
        });
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
                logging(postFileName, `${JSON.stringify(obj)}\n`);
                res.end();
            });
        }
    } else if(req.method === "GET" && reqParams.pathname === "/postdata"){
        if(reqParams.query.type === 'json') console.log('OK!!1');
        res.end();
    } else{
        res.writeHead(404);
        res.end('Not found!');
    }
});

server.listen(PORT, ()=>{
    console.log(`Server running on port: ${PORT}`);
});
