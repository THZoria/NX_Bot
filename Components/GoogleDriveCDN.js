const { google } = require('googleapis');
const readline = require('readline');

setInterval(() => {
    const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
    const TOKEN_PATH = 'token.json';
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), listFiles);

        function authorize(credentials, callback) {
            const {
                client_secret,
                client_id,
                redirect_uris
            } = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(
                client_id,
                client_secret,
                redirect_uris[0]
            );

            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return getAccessToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                callback(oAuth2Client);
            });
        }
    });

    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', code => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    };

    function listFiles(auth) {
        const drive = google.drive({
            version: 'v3',
            auth
        });
        drive.files.list({
                pageSize: 1000,
                q: 'mimeType != \'application/vnd.google-apps.folder',
                fields: 'nextPageToken, files(id, name, size, fileExtension)'
            },
            (err, res) => {
                if (err) return console.log(`The API returned an error: ${err}`);
                const files = res.data.files;
                if (files.length) {
                    let obj = {};
                    let length = files.length;
                    for (let i = 0; i < length; i++) {
                        obj[i] = files[i];
                    };
                    fs.writeFileSync('./Databases/CDN.json', JSON.stringify(obj));
                };
            });
    };
    console.log('CDN Reloaded!')
}, 1800000);
