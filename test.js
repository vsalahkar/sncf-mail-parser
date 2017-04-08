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
    var dates = $(".pnr-summary").text().split(" ");

    function filtreTexte(requete)
    {
        return dates.filter((el) =>
            el.indexOf(requete) > -1
        );
    }

    $(".travel-way").each(function(index, element)
    {
        var trip = {
            trains: [
            {
                passengers: []
            }]
        };

        trip.type = $(element).text().replace(/\s/g, '');
        trip.date = filtreTexte("/20")[index].split(";")[1];
        trip.date = moment(trip.date, "DD-MM-YYYY").format("YYYY-MM-DD") + " 00:00:00.000Z";
        trip.trains[0].departureTime = $(".segment-departure").eq(index * 3).text().replace(/\s/g, '');
        trip.trains[0].departureStation = $(".segment-departure").eq((index * 3) + 1).text();
        trip.trains[0].arrivalTime = $(".segment-arrival").eq(index * 2).text().replace(/\s/g, '');
        trip.trains[0].arrivalStation = $(".segment-arrival").eq((index * 2) + 1).text();
        trip.trains[0].type = $(".segment").eq(index * 3).text().replace(/\s/g, '');
        trip.trains[0].number = $(".segment").eq((index * 3) + 1).text();
        $(".passengers").eq(index).find(".typology").each(function(index, element){
            var isEchangeable = $(element).siblings().filter('.fare-details').text().includes("Billet échangeable");
            trip.trains[0].passengers.push({
                age : $(element).text().split("passager ")[1],
                type : isEchangeable ? "échangeable" : "non échangeable"
            })
        })
        console.log();
        roundTrips.push(trip);
    })
    return roundTrips;
}

var getPassengers = function($)
{
    var passengers = {};
    passengers.type = $(".fare-nam").text();
    passengers.age = $(".typology").eq(2).text().split("passager ")[1];
    return passengers;
}
