const dayjs = require("dayjs");
const {for_sheet, for_params} = require("./lib");

const SPREADSHEET_ID = '1UdtnAGMKfrsRMmsseIedEZ4nmG6HiearDg643qxa374'

test('read google sheet', async () => {
  let sheets = await for_sheet(SPREADSHEET_ID)
  let response = await sheets(async (sheets, params) => {
    return await sheets.spreadsheets.values.get(Object.assign(params, {
      range: "Welcome!B4",
    }))
  })
  expect(response.status).toBe(200);
  expect(response.data.values).toStrictEqual([["Please wait while the exercises are explained."]])
})

let update_params = {
  range: "Welcome!A1",
  valueInputOption: "RAW",
  resource: {
    values: [[`Hello @ ${dayjs().format('HH:mm:ss')}`]]
  }
};

test('update google sheet id', async () => {
  let sheets = await for_sheet(SPREADSHEET_ID)
  let response = await sheets(
    async (sheets, params) => await sheets.spreadsheets.values.update(Object.assign(params, update_params)))
  expect(response.status).toBe(200);
})

test('update google sheet params', async () => {
  let sheets = await for_params(SPREADSHEET_ID)
  let response = await sheets(update_params,
    async (sheets, params) => await sheets.spreadsheets.values.update(params))
  expect(response.status).toBe(200);
})
