// upload-plugin.js

const dotenv = require('dotenv');
const { exec } = require('child_process');

dotenv.config();

const baseUrl = process.env.BASE_URL;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;

const command = `kintone-plugin-uploader --base-url ${baseUrl} --username ${username} --password ${password} plugin.zip`;
exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error(`exec error: ${err}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
