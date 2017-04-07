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
    trips.price = getPrice($);
    trips.trip = getTrip($);
    // trips.train = getTrain($);
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
    var roundTrips = {};
    var trains = {};
    roundTrips.type = $(".travel-way").text();
    // roundTrips.date = $(".pnr-summary").text().split(" ")[5];
    $(".travel-way").each(function(index, element){
        roundTrips.type = $(element).text();
        roundTrips.date = $(".pnr-summary").text().split(" ")[5];
        trains.departureTime = $(".segment-departure").text().split("  ")[index*3].replace(/\s/g,'');
        trains.departureStation = $(".segment-departure").text().split("  ")[(index*3)+1];
        trains.arrivalTime = $(".segment-arrival").text().split("  ")[index*2].replace(/\s/g,'');
        trains.arrivalStation = $(".segment-arrival").text().split("  ")[(index*2)+1];
        trains.type = $(".segment").text().split("  ")[index*3].replace(/\s/g,'');
        trains.number = $(".segment").text().split("  ")[(index*3)+1];
        console.log(roundTrips);
        console.log(trains);
        console.log("\r");
    })
    return roundTrips;
    return trains;
}

// var getTrain = function($)
// {
//     var train = {};
//     train.departureTime = $(".segment-departure").text().split("  ")[0].replace(/\s/g,'');
//     train.departureStation = $(".segment-departure").text().split("  ")[1];
//     train.arrivalTime = $(".segment-arrival").text().split("  ")[0].replace(/\s/g,'');
//     train.arrivalStation = $(".segment-arrival").text().split("  ")[1];
//     train.type = $(".segment").text().split("  ")[0].replace(/\s/g,'');
//     train.number = $(".segment").text().split("  ")[1];
//
//     $(".segment-departure").each(function(index,element){
//         console.log($(element).text().split("  ")[0].replace(/\s/g,''));
//     });
//     return train;
// }

var getPassengers = function($)
{
    var passengers = {};
    passengers.type = $(".fare-nam").text();
    // passengers.age = $("");
    return passengers;
}
