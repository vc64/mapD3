
(function(d3, topojson) {
    'use strict';

    const loadAndProcessData = () =>
        Promise
        .all([
        d3.tsv("https://raw.githubusercontent.com/vc64/mapD3/master/edited_50m.tsv"),
        d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json')
        ])
        .then(([tsvData, topoJSONdata]) => {
        const rowById = tsvData.reduce((accumulator, d) => {
            accumulator[d.iso_n3] = d;
            return accumulator;
        }, {});

        const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

        countries.features.forEach(d => {
            Object.assign(d.properties, rowById[d.id]);
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

    const colorScale = d3.scaleOrdinal();

    // const colorValue = d => d.properties.income_grp;
    var colorValue = d => d.properties.economy;
    console.log(colorValue);

    var i = 1;                  //  set your counter to 1

    loadAndProcessData().then(countries => {

        colorScale
            .domain(countries.features.map(colorValue))
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
            
            colorValue = d => d.properties["day" + i];

            console.log(colorValue);
            g.selectAll("path")
                .transition()
                .delay(1000)
                .duration(1000)
                .attr("fill", d => colorScale(colorValue(d)))
            if (--i) myLoop(i);
            }, 2000)
        })(10);

        });
    }(d3, topojson));