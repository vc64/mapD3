
(function(d3, topojson) {
    'use strict';

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
                blankEntry[key] = "0";
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

    loadAndProcessData().then(countries => {

        console.log(countries.features.map(colorValue))
        colorScale
            .domain([0, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000])
            .domain(colorScale.domain().sort().reverse())
            .range(d3.schemeSpectral[colorScale.domain().length]);

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

        var colors = ["red", "orange", "green", "blue"];

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

        (function myLoop(i) {
            setTimeout(function() {
            
            console.log("" + (2021 - i))
            colorValue = d => d.properties["" + (2021 - i)];

            console.log(colorValue);
            g.selectAll("path")
                .transition()
                .duration(500)
                .attr("fill", d => colorScale(colorValue(d)))
            if (--i) myLoop(i);
            }, 500)
        })(61);

        });
    }(d3, topojson));
