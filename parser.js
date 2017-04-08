var cheerio = require('cheerio');
var moment = require('moment');

var parseMail = function(mailHTML)
{
    $ = cheerio.load(mailHTML,
    {
        ignoreWhitespace: true,
        xmlMode: true
    });
    var result = {};
    var trips = {};
    var custom = {};
    trips.code = getCode($);
    trips.name = getName($);
    trips.details = {};
    trips.details.price = getPrice($);
    trips.details.roundTrips = getTrip($);
    result.trips = [
    {}];
    result.trips[0] = trips;
    result.custom = getCustom($);
    // console.log(JSON.stringify(result, null, 2));
    return result;
}

// Code commande
var getCode = function($)
{
    var htmlElement = $(".pnr-ref").last();
    var code = htmlElement.text().split("  ")[1];
    return code;
}

// Nom commande
var getName = function($)
{
    var htmlElement = $(".pnr-name .pnr-info").last();
    var name = htmlElement.text().replace(/\s/g, '');
    return name;
}

// Prix total commande
var getPrice = function($)
{
    var htmlElement = $(".total-amount .very-important");
    var price = htmlElement.text().replace(/\s/g, '');
    price = price.replace(",", ".");
    price = price.replace("€", "");
    return price;
}

var getCustom = function($)
{
    var custom = {
        prices: []
    };
    var priceElements = $('.cell:nth-child(3n+1), .amount');
    priceElements.each(function(i, el)
    {
        custom.prices.push(
        {
            value: $(el).text().replace(",", ".").replace("€", "").replace(/\s/g, '').replace("&nbsp;&nbsp;", "")
        })
    })
    return custom;
}

// Trajets commande
var getTrip = function($)
{
    var roundTrips = [];
    var dates = $(".pnr-summary").text().split(" ");
    var dates = dates.filter((el) => el.indexOf("/20") > -1);

    $(".travel-way").each(function(tripIndex, tripElement)
    {
        var trip = {
            trains: [
            {
                passengers: []
            }]
        };

        trip.type = $(tripElement).text().replace(/\s/g, '');
        trip.date = dates[tripIndex].split(";")[1];
        trip.date = moment(trip.date, "DD-MM-YYYY").format("YYYY-MM-DD") + " 00:00:00.000Z";
        trip.trains[0].departureTime = $(".segment-departure").eq(tripIndex * 3).text().replace(/\s/g, '');
        trip.trains[0].departureStation = $(".segment-departure").eq((tripIndex * 3) + 1).text();
        trip.trains[0].arrivalTime = $(".segment-arrival").eq(tripIndex * 2).text().replace(/\s/g, '');
        trip.trains[0].arrivalStation = $(".segment-arrival").eq((tripIndex * 2) + 1).text();
        trip.trains[0].type = $(".segment").eq(tripIndex * 3).text().replace(/\s/g, '');
        trip.trains[0].number = $(".segment").eq((tripIndex * 3) + 1).text();
        $(".passengers").eq(tripIndex).find(".typology").each(function(i, passengerElement)
        {
            var isEchangeable = $(passengerElement).siblings().filter('.fare-details').text().includes("Billet échangeable");
            trip.trains[0].passengers.push(
            {
                age: $(passengerElement).text().split("passager ")[1],
                type: isEchangeable ? "échangeable" : "non échangeable"
            })
        })
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

module.exports.parseMail = parseMail;
