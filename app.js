const OAuthClient = require('intuit-oauth');
const http = require('http');
const express = require("express");
const bodyParser = require("body-parser");
const { default: axios } = require('axios');
const app = express();
const httpServer = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const oauthClient = new OAuthClient({
    clientId: 'ABoL4TMay2k2JbEzkOzeYqMfgf9SiClpY1ab3eGikITalZLIks',
    clientSecret: 'QnehcARMPZtfCr9KboJrpDaT4BxR1WZ3teZOXSaH',
    enviroment: 'sandbox',
    redirectUri: 'http://localhost:3000/callback',
});

let oauth_token = null;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
    
});

app.get('/verify', (req, res) => {
    var authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
    res.send(authUri);
});
app.get('/callback', (req, res) => {
    const parseRedirect = req.url;
    oauthClient.createToken(parseRedirect)
        .then( response =>  {
            //console.log('The token is ' + JSON.stringify(response.getJson()));
            oauth_token = response.getJson();
            //console.log(oauth_token)
        })
        .catch(e => {
            console.error('Error msg: ' + e.originalMessage);
            console.error(e.intuit_tid);
        });

        res.send('');
});
app.get('/test-get', async (req, res) => {
    //console.log(oauth_token);
    //const companyID = oauthClient.getToken().realmId;
    const url = 'https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365158292880/companyinfo/4620816365158292880';
    try {
        let result = await axios.get(url, {
            headers: {
                'Authorization': 'Bearer ' + oauth_token.access_token,
            }
        })
        console.log(result.data);
        res.send( result.data );
    }catch (error) {
        console.error('Error: ', error)
    }
});

app.post('/test-invoice', async (req, res) => {
    let invoice = JSON.stringify(req.body);

    console.log(invoice)

    const url = 'https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365158292880/invoice';
    try {
        let result = await axios.post(url, invoice, {
            headers: {
                'Authorization': 'Bearer ' + oauth_token.access_token,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log(response);
        })
    } catch (error) {
        console.error('Error: ', error.response);
    }
})

httpServer.listen(3000);