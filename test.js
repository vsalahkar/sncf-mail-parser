var cheerio = require('cheerio');
var fs = require('fs');
var slashes = require('slashes');
var moment = require('moment');

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
    trips.details = {};
    trips.details.price = getPrice($);
    trips.details.roundTrips = getTrip($);
    console.log(JSON.stringify(trips, null, 2));
    // trips.passengers = getPassengers($);
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
    var name = htmlElement.text().replace(/\s/g, '');
    return name;
}

var getPrice = function($)
{
    var htmlElement = $(".total-amount .very-important");
    var price = htmlElement.text().replace(/\s/g, '');
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
    var roundTrips = [];
    $(".travel-way").each(function(index, element)
    {
        var trip = {
            trains: [
            {}]
        };
        trip.type = $(element).text().replace(/\s/g, '');
        // trip.date = $(".pnr-summary").text().split(" ")[5];
        // trip.date = trip.date.split(";")[1];
        trip.trains[0].departureTime = $(".segment-departure").eq(index * 3).text().replace(/\s/g, '');
        trip.trains[0].departureStation = $(".segment-departure").eq((index * 3) + 1).text();
        trip.trains[0].arrivalTime = $(".segment-arrival").eq(index * 2).text().replace(/\s/g, '');
        trip.trains[0].arrivalStation = $(".segment-arrival").eq((index * 2) + 1).text();
        trip.trains[0].type = $(".segment").eq(index * 3).text().replace(/\s/g, '');
        trip.trains[0].number = $(".segment").eq((index * 3) + 1).text();
        roundTrips.push(trip);
    })
    return roundTrips;
}

// var getPassengers = function($)
// {
//     var passengers = {};
//     passengers.type = $(".fare-nam").text();
//     // passengers.age = $("");
//     return passengers;
// }
