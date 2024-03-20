const dayjs = require("dayjs");

test('format time', async () => {
  let stop = dayjs().add(10, 'minute');
  let remaining = Math.max(0, stop - dayjs())
  let format = dayjs(remaining).format('mm:ss');
  expect(format).toBe("09:59");
});
