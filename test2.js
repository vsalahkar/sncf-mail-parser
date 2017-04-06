var cheerio = require('cheerio');
var fs = require('fs');
var slashes = require('slashes');

fs.readFile('test.html', 'utf-8', (err, data) =>
{
    if (err) throw err;
    data = data.replace(/(?:\\[rn]|[\r\n]+)+/g, "\n");
    data = slashes.strip(data);
    //console.log(data);
    $ = cheerio.load(data,
    {
        ignoreWhitespace: true,
        xmlMode: true
    });
    var trips = {};
    trips.code = getCode($);
    trips.name = getName($);
    trips.price = getPrice($);
    trips.trip = getTrip($);
    trips.train = getTrain($);
    trips.passengers = getPassengers($);
    console.log(trips);
});


var getCode = function($)
{
    var htmlElement = $(".pnr-ref").last();
    var code = htmlElement.text().split("  ")[1];
    return code;
}

var getName = function($)
{
    var htmlElement = $(".pnr-name .pnr-info").last();
    var name = htmlElement.text().replace(/\s/g,'');
    return name;
}

var getPrice = function($)
{
    var htmlElement = $(".total-amount .very-important");
    var price = htmlElement.text().replace(/\s/g,'');
    price = price.replace(",", ".");
    price = price.replace("€", "");
    return price;
}

var getType = function($)
{
    var htmlElement = $(".travel-way");
    var type = htmlElement.text();
    return type;
}

var getTrip = function($)
{
    var trip = {};
    trip.type = $(".travel-way").text();
    trip.date = $(".pnr-summary").text().split(" ");
    return trip;
}

var getTrain = function($)
{
    var train = {};
    train.departureTime = $(".segment-departure").text().split("  ")[0].replace(/\s/g,'');
    train.departureStation = $(".segment-departure").text().split("  ")[1];
    train.arrivalTime = $(".segment-arrival").text().split("  ")[0].replace(/\s/g,'');
    train.arrivalStation = $(".segment-arrival").text().split("  ")[1];
    train.type = $(".segment").text().split("  ")[0].replace(/\s/g,'');
    train.number = $(".segment").text().split("  ")[1];
    return train;
}

var getPassengers = function($)
{
    var passengers = {};
    passengers.type =
    passengers.age =
    return passengers;
}
