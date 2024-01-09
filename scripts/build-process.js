// build-process.js

const dotenv = require('dotenv');
const { exec } = require('child_process');
const fs = require('fs');

dotenv.config();

const ppk = process.env.PPK;
const baseUrl = process.env.BASE_URL;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

let command = 'kintone-plugin-packer src';
if (fs.existsSync(ppk)) {
    command += ` --ppk ${ppk}`;
}

exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error(`exec error: ${err}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});

// Similarly, you can add other commands you want to run as part of your build process.
