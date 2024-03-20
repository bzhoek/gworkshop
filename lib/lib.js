const {auth} = require("google-auth-library");
const {google} = require("googleapis");
const os = require("os");
const fs = require("fs");

const get_config = (path) => {
  let expanded = path.replace("~", os.homedir())
  let buffer = fs.readFileSync(expanded)
  return JSON.parse(buffer)
}

async function get_sheet(spreadsheetId) {
  const sheets = await get_sheets()
  return async (body) => {
    let params = {spreadsheetId: spreadsheetId}
    if (body) {
      Object.assign(params, {requestBody: body})
    }
    return await sheets.spreadsheets.get(params)
  }
}

async function get_sheets() {
  const creds = get_config('~/.dotfiles/jirest-5aa8b78efeef.json') // jirest-service-account@jirest.iam.gserviceaccount.com
  const client = await auth.fromJSON(creds);
  client.scopes = ['https://www.googleapis.com/auth/spreadsheets'];

  return google.sheets({version: 'v4', auth: client});
}

async function delete_sheets(spreadsheetId, parent) {
  const sheets = await get_sheets()
  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId
  });

  const pattern = new RegExp(parent + " \\d")
  response.data.sheets
    .filter(sheet => sheet.properties.title.match(pattern))
    .forEach(sheet => delete_sheet(spreadsheetId, sheets, sheet.properties.sheetId))
}

async function delete_sheet(spreadsheetId, sheets, sheetId) {
  const request = {
    requests: [{
      deleteSheet: {
        sheetId: sheetId,
      }
    }]
  }

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    requestBody: request
  });
  return response;
}

async function duplicate_sheets(spreadsheetId, title, copies = 1) {
  const sheets = await get_sheets()
  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId
  });

  const sheet = response.data.sheets
    .find(sheet => sheet.properties.title.match(title))

  for (let index = 0; index < copies; index++) {
    await duplicate_sheet(spreadsheetId, sheets, sheet, index + 1)
  }
}

async function duplicate_sheet(spreadsheetId, sheets, sheet, index) {
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
    spreadsheetId: spreadsheetId,
    requestBody: request
  });
  return response;
}

async function hide_sheets(spreadsheetId, parent, hidden = true) {
  const sheets = await get_sheets()
  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId
  });
  const pattern = new RegExp(parent + " \\d")
  response.data.sheets
    .filter(sheet => sheet.properties.title.match(pattern))
    .forEach(sheet => hide_sheet(spreadsheetId, sheets, sheet.properties.sheetId, hidden))
}

async function hide_sheet(spreadsheetId, sheets, sheetId, hidden = true) {
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
    spreadsheetId: spreadsheetId,
    requestBody: request
  });
  return response;
}


module.exports = {delete_sheets, duplicate_sheets, hide_sheets}