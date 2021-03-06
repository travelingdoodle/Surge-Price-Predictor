
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCCy8pzN-PhzClI9_biA_eNwXlK77CMrtw",
    authDomain: "surgeprediction.firebaseapp.com",
    databaseURL: "https://surgeprediction.firebaseio.com",
    projectId: "surgeprediction",
    storageBucket: "surgeprediction.appspot.com",
    messagingSenderId: "807686524220"
};
firebase.initializeApp(config);
database = firebase.database();

var ref = database.ref("saving-data");
var popRef = ref.child("rain");
var tmRef = ref.child("ticketMaster");
var tmEventRef = ref.child("ticketMaster").child("tmObject").child("page");


//  ----------  WUNDERGROUND API  ---------
function weather() {

    // weatherURL = "http://api.wunderground.com/api/050cc66bcd917a79/geolookup/hourly/q/autoip.json"; 
    $.ajax({
        url: "https://api.wunderground.com/api/050cc66bcd917a79/satellite/geolookup/hourly/q/autoip.json",
        method: "GET"
    }).done(function (response) {
        $("#pop0").append(response.hourly_forecast[0].pop + "%" + ".");
        $("#pop1").append(response.hourly_forecast[1].pop + "%" + ".");
        $("#pop2").append(response.hourly_forecast[2].pop + "%" + ".");

        var rainRef = ref.child("rain");
        rainRef.update({
            hour1: response.hourly_forecast[0].pop,
            hour2: response.hourly_forecast[1].pop,
            hour3: response.hourly_forecast[2].pop
        });

        //puts a sat image map in the canvas
        var weatherGif = response.satellite.image_url_vis;
        $("#satMap").html('<img src="' + weatherGif + '">');

    })
};
weather();

function ticketMasterThings() {
    //  --------- MOMENT.JS VARIABLES TO USE WITH TICKETMASTER API  ----------
    var currentTime = moment();
    currentTimeFormatted = moment(currentTime).format("YYYY-MM-DD HH:mm");
    var urlCurrentDate = moment(currentTimeFormatted).format("YYYY-MM-DD");
    var urlCurrentTime = moment(currentTimeFormatted).format("HH:mm:ss");
    var urlEndTime = currentTime.add(moment.duration(3, 'hours')).format("HH:mm:ss");
    var tmURL = urlCurrentDate + "T" + urlCurrentTime + "Z&endDateTime=" + urlCurrentDate + "T" + urlEndTime;

    //  ----------  TICKET MASTER  ----------
    $.ajax({
        type: "GET",

        // -- geopoint five miles date/time, categories of sports & music
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=xk2KuXCdtzC0ssvGGZAk2ysiqOtl0dd1&geoPoint&radius=5&unit=miles&startDateTime=" + tmURL + "Z&classificationName=Sports&classificationId=KZFzniwnSyZfZ7v7nJ",
        // THIS IS WHAT THE tmURL SHOULD BE RECREATING "2017-08-09T18:52:00Z&endDateTime=2017-08-09T21:53:00"
        async: true,
        dataType: "json",
        success: function (json) {
            // Parse the response.
            // Do other things.

            // This is accessing the child 'ticetkMaster'
            var tmRef = ref.child("ticketMaster");
            // updates fb with the object
            tmRef.update({
                tmObject: json,
            });

            // This will reference the firebase and print the info to the console & HTML       
            tmRef.orderByChild("tmObject").on("child_added", function (snapshot) {
                $("#numOfEvents").append("There are " + snapshot.val().page.number + " events during the next three hours");
            });
        },
        error: function (xhr, status, err) {
            // This time, we do not end up here!
        }
    });

};
ticketMasterThings();

// ---------- BEGIN LOGIC FOR CALCULATING CHANCE OF SURGE PRICING ----------
function state() {
    var POP = 0;
    var POP1 = 0;
    var POP2 = 0;
    var eventTrue;
    var state = 0;
    var state1 = 0;
    var state2 = 0;
    // sets var for CURRENT POP to compare in the things below
    popRef.on("value", function (snapshot) {

        currentPOP = snapshot.val();
        POP = currentPOP.hour1;
        POP1 = currentPOP.hour2;
        POP2 = currentPOP.hour3;

        // sets variables for an events ending this hour
        tmEventRef.on("value", function (snapshot) {
            var wholeObj = snapshot.val();
            var evntNow = wholeObj.number;

            //setting evntNow to boolean 
            if (evntNow > 0) {
                eventTrue = true;
                // console.log("event happening this hour: " + eventTrue);
            }
            else {
                eventTrue = false;
            }
            // ---------------- KEY FOR STATE VALUES ----------------
            // RAIN >85 +5
            // RAIN >75 +4
            // RAIN >50 +3
            // EVENT ENDING THIS HOUR + 5
            // 10 = 99% CHANCE OF SURGE 
            // 9 = 95% CHANCE OF SURGE
            // 8 = 85%
            // 5 = 80%
            // 4 = 75%
            // 3 = 50%

            // logic to calculate chance (percentage) of surge pricing (by setting state for chart.js)
            if (POP >= 85 && eventTrue === true) {
                state = 99;
                if (POP1 >= 85 && eventTrue === true) {
                    state1 = 99;
                }
                if (POP2 >= 85 && eventTrue === true) {
                    state2 = 99;
                }
            }
            else if (POP >= 75 && POP < 85 && eventTrue === true) {
                state = 90;
                if (POP1 >= 75 && eventTrue === true) {
                    state1 = 90;
                }
                if (POP2 >= 75 && eventTrue === true) {
                    state2 = 90;
                }
            }
            else if (POP >= 50 && POP < 75 && eventTrue === true) {
                state = 85;
                if (POP1 >= 50 && eventTrue === true) {
                    state1 = 85;
                }
                if (POP2 >= 50 && eventTrue === true) {
                    state2 = 85;
                }
            }
            else if (POP >= 75) {
                state = 70;
                if (POP1 >= 75) {
                    state1 = 70;
                }
                if (POP2 >= 75) {
                    state2 = 70;
                }
            }
            else if (POP >= 50) {
                state = 50;
                if (POP1 >= 50) {
                    state1 = 50;
                }
                if (POP2 >= 50) {
                    state2 = 50;
                }
            }
            else if (POP >= 25) {
                state = 25;
                if (POP1 >= 25) {
                    state1 = 25;
                }
                if (POP2 >= 25) {
                    state2 = 25;
                }
            }
            else if (POP >= 10) {
                state = 10;
                if (POP1 >= 10) {
                    state1 = 10;
                }
                if (POP2 >= 10) {
                    state2 = 10;
                }
            }
            else if (POP < 10 && POP != 0) {
                state = 5;
                if (POP1 < 10 && POP1 != 0) {
                    state1 = 5;
                }
                if (POP2 < 10 && POP2 != 0) {
                    state2 = 5;
                }
            }
            else {
                state = 0;
                state1 = 0;
                state2 = 0;
            }
            var fireState = ref.child("state");
            fireState.update({
                state: state,
                state1: state1,
                state2: state2
            });
        });
    });
};// end of doc ready

state();
