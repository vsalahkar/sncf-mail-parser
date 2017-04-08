var fs = require('fs');
var slashes = require('slashes');
var parser = require('./parser');

fs.readFile('test.html', 'utf-8', (err, data) =>
{
    if (err) throw err;
    data = data.replace(/(?:\\[rn]|[\r\n]+)+/g, "\n");
    data = slashes.strip(data);
    var result = parser.parseMail(data);
    fs.writeFileSync("test-result.json", JSON.stringify(result, null, 2), "utf-8");
});
