function getChartColorsArray(r) {
    r = $(r).attr("data-colors");
    console.log(r)
    return (r = JSON.parse(r)).map(function (r) {
        console.log(r)
        r = r.replace(" ", "");
        if (-1 == r.indexOf("--")) return r;
        r = getComputedStyle(document.documentElement).getPropertyValue(r);
        return r || void 0
    })
}
var minichart1Colors = getChartColorsArray("#mini-chart1"),
    options = {
        series: [{
            data: [2, 10, 18, 22, 36, 15, 47, 75, 65, 19, 14, 2, 47, 42, 15]
        }],
        chart: {
            type: "line",
            height: 50,
            sparkline: {
                enabled: !0
            }
        },
        colors: minichart1Colors,
        stroke: {
            curve: "smooth",
            width: 2
        },
        tooltip: {
            fixed: {
                enabled: !1
            },
            x: {
                show: !1
            },
            y: {
                title: {
                    formatter: function (r) {
                        return ""
                    }
                }
            },
            marker: {
                show: !1
            }
        }
    },
    chart = new ApexCharts(document.querySelector("#mini-chart1"), options);
chart.render();
var minichart2Colors = getChartColorsArray("#mini-chart2"),
    options = {
        series: [{
            data: [15, 42, 47, 2, 14, 19, 65, 75, 47, 15, 42, 47, 2, 14, 12]
        }],
        chart: {
            type: "line",
            height: 50,
            sparkline: {
                enabled: !0
            }
        },
        colors: minichart2Colors,
        stroke: {
            curve: "smooth",
            width: 2
        },
        tooltip: {
            fixed: {
                enabled: !1
            },
            x: {
                show: !1
            },
            y: {
                title: {
                    formatter: function (r) {
                        return ""
                    }
                }
            },
            marker: {
                show: !1
            }
        }
    };
(chart = new ApexCharts(document.querySelector("#mini-chart2"), options)).render();
var minichart3Colors = getChartColorsArray("#mini-chart3"),
    options = {
        series: [{
            data: [47, 15, 2, 67, 22, 20, 36, 60, 60, 30, 50, 11, 12, 3, 8]
        }],
        chart: {
            type: "line",
            height: 50,
            sparkline: {
                enabled: !0
            }
        },
        colors: minichart3Colors,
        stroke: {
            curve: "smooth",
            width: 2
        },
        tooltip: {
            fixed: {
                enabled: !1
            },
            x: {
                show: !1
            },
            y: {
                title: {
                    formatter: function (r) {
                        return ""
                    }
                }
            },
            marker: {
                show: !1
            }
        }
    };
(chart = new ApexCharts(document.querySelector("#mini-chart3"), options)).render();
var minichart4Colors = getChartColorsArray("#mini-chart4"),
    options = {
        series: [{
            data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14, 2, 47, 42, 15]
        }],
        chart: {
            type: "line",
            height: 50,
            sparkline: {
                enabled: !0
            }
        },
        colors: minichart4Colors,
        stroke: {
            curve: "smooth",
            width: 2
        },
        tooltip: {
            fixed: {
                enabled: !1
            },
            x: {
                show: !1
            },
            y: {
                title: {
                    formatter: function (r) {
                        return ""
                    }
                }
            },
            marker: {
                show: !1
            }
        }
    };
(chart = new ApexCharts(document.querySelector("#mini-chart4"), options)).render();
var piechartColors = getChartColorsArray("#wallet-balance"),
    options = {
        series: [35, 70, 15],
        chart: {
            width: 227,
            height: 227,
            type: "pie"
        },
        labels: ["Ethereum", "Bitcoin", "Litecoin"],
        colors: piechartColors,
        stroke: {
            width: 0
        },
        legend: {
            show: !1
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                }
            }
        }]
    };
(chart = new ApexCharts(document.querySelector("#wallet-balance"), options)).render();
var radialchartColors = getChartColorsArray("#invested-overview"),
    options = {
        chart: {
            height: 270,
            type: "radialBar",
            offsetY: -10
        },
        plotOptions: {
            radialBar: {
                startAngle: -130,
                endAngle: 130,
                dataLabels: {
                    name: {
                        show: !1
                    },
                    value: {
                        offsetY: 10,
                        fontSize: "18px",
                        color: void 0,
                        formatter: function (r) {
                            return r + "%"
                        }
                    }
                }
            }
        },
        colors: [radialchartColors[0]],
        fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                type: "horizontal",
                gradientToColors: [radialchartColors[1]],
                shadeIntensity: .15,
                inverseColors: !1,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [20, 60]
            }
        },
        stroke: {
            dashArray: 4
        },
        legend: {
            show: !1
        },
        series: [80],
        labels: ["Series A"]
    };