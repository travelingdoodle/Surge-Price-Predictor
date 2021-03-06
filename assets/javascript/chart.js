function makeChart() {
    // Reference the target div
    var ctx = document.getElementById("canvas1").getContext('2d');

    // Create new instance of a chart
    var myChart = new Chart(ctx, {
        //Define chart type
        type: 'bar',
        data: {

            // x-axis labels
            labels: ["Now", "+1 Hour", "+2 Hours"],

            datasets: [{
                // Chart label
                label: '% for surge',

                // Weather data
                data: [25, 50, 75],
                // Data colors to be set later
                backgroundColor: [],
                borderColor: '#000000',
                borderWidth: 1,
                hoverBorderWidth: 3
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: '#FFFFFF'
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: true,
                        color: '#FFFFFF'
                    },
                    ticks: {
                        display: true,
                        fontColor: '#FFFFFF'
                    }
                }],
                yAxes: [{
                    ticks: {
                        // Forces y-axis to go from 0 to 100
                        beginAtZero: true,
                        max: 100,
                        steps: 10,
                        stepValue: 10,
                        fontColor: '#FFFFFF'
                    },
                    gridLines: {
                        display: true,
                        color: '#FFFFFF'
                    }
                }]
            }
        }
    });

    var bars = myChart.data.datasets[0];

    function getState() {
        var chartState;
        var chartState1;
        var chartState2;

        // attempt to use firebase .ref to pull data in this file
        var fireState = ref.child("state");
        fireState.on("value", function (snapshot) {

            currentState = snapshot.val();
            chartState = currentState.state;
            chartState1 = currentState.state1;
            chartState2 = currentState.state2;
            bars.data[0] = parseInt(currentState.state);
            bars.data[1] = chartState1;
            bars.data[2] = chartState2;
            myChart.update();
            // Change color of data based on data value
            for (i = 0; i < bars.data.length; i++) {
                if (bars.data[i] <= 33) {
                    bars.backgroundColor[i] = '#7FFF00';
                } else if (bars.data[i] > 33 & bars.data[i] <= 66) {
                    bars.backgroundColor[i] = '#FFFF00';
                } else if (bars.data[i] > 66 & bars.data[i] <= 85) {
                    bars.backgroundColor[i] = '#FF8C00';
                } else {
                    bars.backgroundColor[i] = '#DC143C';
                }
            }
            myChart.update();
        })
    };
    getState();
};
makeChart();
