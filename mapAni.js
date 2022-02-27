// import { sliderBottom } from "./slider.js"


(function(d3, topojson) {
    'use strict';

    var dataTime = d3.range(0, 10).map(function(d) {
        return new Date(1995 + d, 10, 3);
    });
    
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(300)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(1998, 10, 3))
        .on('onchange', val => {
            d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        });
    
    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');
    
    gTime.call(sliderTime);
    
    d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));

    const loadAndProcessData = () =>
        Promise
        .all([
            d3.csv("gdp_total_billion_ibancode_2020.csv"),
            d3.json('50m.json')
        ])
        .then(([csvData, topoJSONdata]) => {
        const rowById = csvData.reduce((accumulator, d) => {
            accumulator[d.NumCode] = d;
            return accumulator;
        }, {});

        const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

        
        var blankEntry = rowById[countries.features[0].id]

        for (const key in blankEntry) {

            if (!isNaN(key)) {
                blankEntry[key] = "-1";
            }
        }

        // console.log(blankEntry);

        countries.features.forEach(d => {
            // console.log(typeof [1,2,3])
            if (typeof rowById[d.id] === 'object') {
                Object.assign(d.properties, rowById[d.id]);
            } else {
                blankEntry["NumCode"] = d.id;
                Object.assign(d.properties, blankEntry);
            }

            // Object.assign(d.properties, rowById[d.id]);

            // console.log(typeof rowById[d.id] === 'object')
            // console.log(d.properties)
        });

            return countries;
        });

    const colorLegend = (selection, props) => {
        const {
        colorScale,
        circleRadius,
        spacing,
        textOffset,
        backgroundRectWidth
        } = props;

        const backgroundRect = selection.selectAll('rect')
        .data([null]);
        const n = colorScale.domain().length;
        backgroundRect.enter().append('rect')
        .merge(backgroundRect)
        .attr('x', -circleRadius * 2)
        .attr('y', -circleRadius * 2)
        .attr('rx', circleRadius * 2)
        .attr('width', backgroundRectWidth)
        .attr('height', spacing * n + circleRadius * 2)
        .attr('fill', 'white')
        .attr('opacity', 0.8);


        const groups = selection.selectAll('.tick')
        .data(colorScale.domain());
        const groupsEnter = groups
        .enter().append('g')
        .attr('class', 'tick');
        groupsEnter
        .merge(groups)
        .attr('transform', (d, i) =>
            `translate(0, ${i * spacing})`
        );
        groups.exit().remove();

        groupsEnter.append('circle')
        .merge(groups.select('circle'))
        .attr('r', circleRadius)
        .attr('fill', colorScale);

        groupsEnter.append('text')
        .merge(groups.select('text'))
        .text(d => d)
        .attr('dy', '0.32em')
        .attr('x', textOffset);
    };

    const svg = d3.select('svg');

    const projection = d3.geoNaturalEarth1();
    const pathGenerator = d3.geoPath().projection(projection);

    var g = svg.append('g');

    const colorLegendG = svg.append('g')
        .attr('transform', `translate(40,310)`);

    g.append('path')
        .attr('class', 'sphere')
        .attr('d', pathGenerator({
        type: 'Sphere'
        }));

    svg.call(d3.zoom().on('zoom', () => {
        g.attr('transform', d3.event.transform);
    }));

    const colorScale = d3.scaleLinear();

    // const colorValue = d => d.properties.income_grp;
    var colorValue = d => d.properties["1960"];
    console.log(colorValue);

    var i = 1;                  //  set your counter to 1

    // .range(d3.schemeSpectral[colorScale.domain().length])

    loadAndProcessData().then(countries => {
        
        var startDate = 1960;
        var endDate = 2020;
        var dates = [];

        for (var i = startDate; i <= endDate; i++) {
            dates.push(i);
        }
        
        var dataTime = d3.range(startDate, endDate+1).map(function(d) {
            return new Date(d, 10, 3);
        });
        
        var sliderTime = d3
            .sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(1000)
            .tickFormat(d3.timeFormat('%Y'))
            .ticks(5)
            .default(new Date(startDate, 10, 3))
            .on('onchange', val => {
                  d3.select('p#value').text(d3.timeFormat('%Y')(val));
                  console.log(sliderTime.value());
            });
        
        var gTime = d3
            .select('div#slider')
            .append('svg')
            .attr('width', "80vh")
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');
        
        gTime.call(sliderTime);
        
        d3.select('p#value').text(d3.timeFormat('%Y')(sliderTime.value()));


        
        // console.log(countries.features.map(colorValue))
        // colorScale
        //     .domain([0, 10000])
        //     .range(["yellow", "red"])

        var name = "Plasma";
        var n = 10;
        let dark;
        let colors;

        if (d3[`scheme${name}`] && d3[`scheme${name}`][n]) {
            colors = d3[`scheme${name}`][n];
            dark = d3.lab(colors[0]).l < 50;
        } else {
            const interpolate = d3[`interpolate${name}`];
            colors = [];
            dark = d3.lab(interpolate(0)).l < 50;
            for (let i = 0; i < n; ++i) {
              colors.push(d3.rgb(interpolate(i / (n - 1))).hex());
            }
        }

        console.log(colors);

        colorScale
            .domain([-1, 0, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000].reverse())
            .range(colors.reverse());
        // colorScale
        //     .domain([-1, 0, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000].reverse())
        //     .range(["#f0f0f0", "#03045e", "#023e8a", "#0077b6", "#0096c7", "#00b4d8", "#48cae4", "#90e0ef", "#ade8f4", "#caf0f8"].reverse());

        colorLegendG.call(colorLegend, {
            colorScale,
            circleRadius: 8,
            spacing: 20,
            textOffset: 12,
            backgroundRectWidth: 235
        });

        g.selectAll('path').data(countries.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .attr("fill", d => colorScale(colorValue(d)))

        /* g.selectAll('path').data(countries.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .attr('fill', d => colorScale(colorValue(d)))
            .transition()
            .duration(1000)
            .style("fill", d => colorScale(colorValue(d)))
            .append('title')
            .text(d => d.properties.name + ': ' + colorValue(d)); */

        // var colors = ["red", "orange", "green", "blue"];

        /* colors.forEach(function(d,i) {
            setTimeout(function() {
            console.log(d)
            if (i % 2 == 0) {
                colorValue = d => d.properties.continent;
            } else {
                colorValue = d => d.properties.economy;
            }

            console.log(colorValue);
            g.selectAll('path').data(countries.features)
                .attr('class', 'country')
                .attr('d', pathGenerator)
            .transition()
                .delay(1000)
                .duration(1000)
                .style("fill", d)
            }, 1000);
        }); */

        function colorValue(d, i) {
            var out = d.properties["" + (2021 - i)];
            if (out == "NA") {
                out = -1;
            }
            return out
        }

        (function myLoop(i) {
            setTimeout(function() {
            
            // console.log("" + (2021 - i))
            // function
            // colorValue = d => d.properties["" + (2021 - i)];

            // console.log(colorValue);
            g.selectAll("path")
                .transition()
                .duration(500)
                .attr("fill", d => colorScale(colorValue(d, i)))
            if (--i) myLoop(i);
            }, 500)
        })(61);

        });
    }(d3, topojson));
