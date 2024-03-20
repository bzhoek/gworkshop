const {google} = require('googleapis');
const {auth} = require('google-auth-library');
const os = require("os");
const fs = require("fs");

const get_config = (path) => {
  let expanded = path.replace("~", os.homedir())
  let buffer = fs.readFileSync(expanded)
  return JSON.parse(buffer)
}

const SPREADSHEET_ID = '1UdtnAGMKfrsRMmsseIedEZ4nmG6HiearDg643qxa374'

test('read google sheet', async () => {
  const creds = get_config('~/.dotfiles/jirest-5aa8b78efeef.json') // jirest-service-account@jirest.iam.gserviceaccount.com
  const client = await auth.fromJSON(creds);
  client.scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

  const sheets = google.sheets({version: 'v4', auth: client});
  const get_response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Welcome!B4",
  });
  expect(get_response.status).toBe(200);
  expect(get_response.data.values).toStrictEqual([["Please wait while the exercises are explained."]])
});

