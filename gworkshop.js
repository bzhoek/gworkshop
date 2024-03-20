const {Command} = require('commander');
const {delete_sheets, duplicate_sheets, hide_sheets} = require("./lib/lib");

let cli = new Command()
cli.name('gworkshop')
  .requiredOption('-s, --sheet <sheetId>', 'Google Sheet ID')
  .description(`Update Google Sheets used for workshops`)

cli.command('timebox')
  .description('Start a timebox')
  .argument('<minutes>', 'Duration of timebox')
  .action((minutes) => console.log('timebox', minutes, cli.opts()))

cli.command('copy')
  .description('Make sheet copies')
  .argument('<title>', 'Title of the sheet to copy')
  .argument('<copies>', 'Number of copies')
  .action((title, copies) => duplicate_sheets(cli.opts().sheet, title, copies))

cli.command('delete')
  .description('Delete sheet copies')
  .argument('<title>', 'Title of the original sheet')
  .action((title) => delete_sheets(cli.opts().sheet, title))

cli.command('reveal')
  .description('Reveal sheet copies')
  .argument('<title>', 'Title of the original sheet')
  .action((title) => hide_sheets(cli.opts().sheet, title, false))

cli.parse()