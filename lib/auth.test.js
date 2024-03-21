const {google} = require('googleapis');
const {auth} = require('google-auth-library');
const dayjs = require("dayjs");
const {get_config, for_sheet, for_params} = require("./lib");

const SPREADSHEET_ID = '1UdtnAGMKfrsRMmsseIedEZ4nmG6HiearDg643qxa374'

async function find_sheet(sheets, title) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID
  });
  expect(response.status).toBe(200);
  let sheet = response.data.sheets.find(sheet => sheet.properties.title === title)
  return sheet;
}

async function delete_sheets(sheets, pattern) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID
  });
  expect(response.status).toBe(200);
  response.data.sheets
    .filter(sheet => sheet.properties.title.match(pattern))
    .forEach(sheet => delete_sheet(sheets, sheet.properties.sheetId))
}

async function delete_sheet(sheets, sheetId) {
  const request = {
    requests: [{
      deleteSheet: {
        sheetId: sheetId,
      }
    }]
  }

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: request
  });
  return response;
}

async function copy_sheets(sheets, title, copies = 1) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID
  });
  const sheet = response.data.sheets
    .find(sheet => sheet.properties.title.match(title))
  expect(sheet).not.toBeUndefined();
  console.log(sheet)

  for (let index = 0; index < copies; index++) {
    await copy_sheet(sheets, sheet, index + 1)
  }
}

async function copy_sheet(sheets, sheet, index) {
  const request = {
    requests: [{
      duplicateSheet: {
        insertSheetIndex: sheet.properties.index + index,
        newSheetName: sheet.properties.title + ` ${index}`,
        sourceSheetId: sheet.properties.sheetId,
      }
    }]
  }

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: request
  });
  return response;
}

async function hide_sheets(sheets, pattern, hidden = true) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID
  });
  expect(response.status).toBe(200);
  response.data.sheets
    .filter(sheet => sheet.properties.title.match(pattern))
    .forEach(sheet => hide_sheet(sheets, sheet.properties.sheetId, hidden))
}

async function hide_sheet(sheets, sheetId, hidden = true) {
  const request = {
    requests: [{
      updateSheetProperties: {
        properties: {
          sheetId: sheetId,
          hidden: hidden
        },
        fields: "hidden"
      }
    }]
  }

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: request
  });
  return response;
}

test('write google sheet', async () => {
  const creds = get_config('~/.dotfiles/jirest-5aa8b78efeef.json') // jirest-service-account@jirest.iam.gserviceaccount.com
  const client = await auth.fromJSON(creds);
  client.scopes = ['https://www.googleapis.com/auth/spreadsheets'];

  const sheets = google.sheets({version: 'v4', auth: client});
  const get_response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Welcome!B4",
  });
  expect(get_response.status).toBe(200);
  expect(get_response.data.values).toStrictEqual([["Please wait while the exercises are explained."]])

  const set_response = await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "Welcome!A1",
    valueInputOption: "RAW",
    resource: {
      values: [[`Hello @ ${dayjs().minute()}`]]
    }
  });
  expect(set_response.status).toBe(200);

  // let welcome = await find_sheet(sheets, "Welcome")
  // console.log(welcome)

  // await delete_sheets(sheets, new RegExp("Bucket sort \\d"))
  // await delete_sheets(sheets, new RegExp("Key Results \\d"))

  // await copy_sheets(sheets, "Bucket sort", 4)
  // await hide_sheets(sheets, new RegExp("Bucket sort \\d"), false)

  return
  const hide_response = await hide_sheet(sheets);
  expect(hide_response.status).toBe(200);

  const duplicate_request = {
    requests: [{
      duplicateSheet: {
        insertSheetIndex: welcome.properties.index + 1,
        newSheetName: "Another welcome",
        sourceSheetId: welcome.properties.sheetId,
      }
    }]
  }

  const duplicate_response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: duplicate_request
  });

  expect(duplicate_response.status).toBe(200);
  console.log(duplicate_response.data.values)

});

