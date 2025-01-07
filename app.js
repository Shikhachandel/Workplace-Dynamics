// SVG Dimensions
const width = 1400;
const height = 1000;

// Select SVG container
const svg = d3.select("#chart").attr("width", width).attr("height", height);

// Margin convention
const margin = { top: 20, right: 50, bottom: 40, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Group for chart
const chartGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Left and Right Chart Areas
const barChartGroup = chartGroup.append("g").attr("transform", `translate(0, 0)`);
const radialChartGroup = chartGroup.append("g").attr("transform", `translate(${innerWidth / 2 + 100}, 0)`);
const geospatialChartGroup = chartGroup.append("g").attr("transform", `translate(0, ${innerHeight / 2 + 50 }) `);

// Tooltip
const tooltip = d3.select("#tooltip").style("opacity", 0);

// Dynamic color mapping
const responseColors = {};
const color = response => {
    if (!responseColors[response]) {
        const availableColors = d3.schemeCategory10;
        responseColors[response] = availableColors[Object.keys(responseColors).length % availableColors.length];
    }
    return responseColors[response];
};

// Function to initialize the graph
function createGraph(data) {
    const genders = Array.from(new Set(data.map(d => d.gender))); // Extract unique genders
    // const years = Array.from(new Set(data.map(d => d.year))); // Extract unique years

    // Populate dropdown
    const genderDropdown = d3.select("#gender-filter");
    genderDropdown.selectAll("option")
        .data(["All","Female","Male"])
        .join("option")
        .attr("value", d => d)
        .text(d => d);

    // Populate year dropdown
    // const yearDropdown = d3.select("#year-filter");
    // yearDropdown.selectAll("option")
    //     .data(["All", ...years])
    //     .join("option")
    //     .attr("value", d => d)
    //     .text(d => d);

    // Initial render
    renderCharts(data);

   // Filter data based on selected gender and year
   function updateCharts() {
        const selectedGender = genderDropdown.property("value");
        // const selectedYear = yearDropdown.property("value");

        const filteredData = data.filter(d => 
            (selectedGender === "All" || d.gender === selectedGender) 
            // &&
            // (selectedYear === "All" || d.year == selectedYear)
        );

        renderCharts(filteredData);
    }

    genderDropdown.on("change", updateCharts);
    // yearDropdown.on("change", updateCharts);
}

// Function to render all charts
function renderCharts(filteredData) {
    barChartGroup.selectAll("*").remove();
    radialChartGroup.selectAll("*").remove();
    geospatialChartGroup.selectAll("*").remove();

    // const genders = Array.from(new Set(filteredData.map(d => d.gender))); // Update genders based on filtered data
    createGroupedBarChart(filteredData);
    createRadialChart(filteredData);
    createGeospatialChart(filteredData);
}

// Load data
d3.csv("Datasetedit.csv").then(data => {
    // data.forEach(d => {
    //     d.year = new Date(d.Date).getFullYear(); // Extract year
    // });
    createGraph(data);
}).catch(error => console.error("Error loading data:", error));

// Grouped Bar Chart
function createGroupedBarChart(data) {
    const graphWidth = innerWidth / 2 - 50;
    const graphHeight = innerHeight / 2 - 50;

    const categories = ["benefits", "care_options", "wellness_program", "seek_help", "leave"];
    const responses = Array.from(new Set(categories.flatMap(category => 
        data.map(d => d[category])
    )));

    // Aggregate data for categories and responses
    const aggregatedData = categories.map(category => {
        const counts = d3.rollup(
            data,
            v => v.length,
            d => d[category]
        );

        return {
            category,
            responses: Array.from(counts, ([response, count]) => ({ response, count }))
        };
    });

    // Scales
    const x0 = d3.scaleBand()
        .domain(categories)
        .range([0, graphWidth])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(responses)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(aggregatedData.flatMap(d =>
            d.responses.map(r => r.count)
        ))])
        .nice()
        .range([graphHeight, 0]);

    // Axes
    barChartGroup.append("g").call(d3.axisLeft(y));

    barChartGroup.append("g")
        .attr("transform", `translate(0,${graphHeight})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Bars
    barChartGroup.selectAll("g.category")
        .data(aggregatedData)
        .join("g")
        .attr("class", "category")
        .attr("transform", d => `translate(${x0(d.category)},0)`)
        .selectAll("rect")
        .data(d => d.responses)
        .join("rect")
        .attr("x", d => x1(d.response))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => graphHeight - y(d.count))
        .attr("fill", d => color(d.response))
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Response: ${d.response}<br>Count: ${d.count}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 28}px`);
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "5px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "3px")
        .style("opacity", 0);

    // Legend
    const legend = barChartGroup.append("g").attr("transform", `translate(${graphWidth + 10}, 50)`);

    legend.selectAll(".legend-item")
        .data(responses)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
            g.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", d => color(d));

            g.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .text(d => d)
                .style("font-size", "12px")
                .style("alignment-baseline", "middle");
        });
}

// Radial Chart
function createRadialChart(filteredData) {
    const radialWidth = innerWidth / 2 - 50;
    const radialHeight = innerHeight / 2 - 50;
    const radius = Math.min(radialWidth, radialHeight) / 2 - 50;

    const categories = [
        "mental_health_consequence",
        "work_interfere",
        "coworkers",
        "supervisor",
        "mental_health_interview",
        "phys_health_interview",
        "mental_vs_physical",
        "obs_consequence"
    ];

    const responses = ["Yes","No","Maybe"]; // Radial axis labels

    // Aggregate data by response type
    const aggregatedData = responses.map(response => {
        const scores = categories.map(category => {
            const total = filteredData.length;
            const count = filteredData.filter(d => d[category] === response).length;
            return total > 0 ? count / total : 0; // Normalize to percentage
        });
        return { response, scores };
    });

    const angleScale = d3.scaleLinear()
        .domain([0, categories.length])
        .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, radius]);

    // Clear previous render
    radialChartGroup.selectAll("*").remove();

    // Create radial chart group
    const radialGroup = radialChartGroup.append("g").attr("transform", `translate(${radialWidth / 2}, ${radialHeight / 2})`);

    // Draw concentric circles
    radialGroup.selectAll("circle")
        .data([0.2, 0.4, 0.6, 0.8, 1])
        .join("circle")
        .attr("r", d => radiusScale(d))
        .attr("fill", "none")
        .attr("stroke", "#ccc");

    // Draw axis lines
    radialGroup.selectAll(".axis")
        .data(categories)
        .join("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radiusScale(1) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("y2", (d, i) => radiusScale(1) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("stroke", "#ccc");

    // Add category labels
    radialGroup.selectAll(".label")
        .data(categories)
        .join("text")
        .attr("x", (d, i) => radiusScale(1.1) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("y", (d, i) => radiusScale(1.1) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("text-anchor", "middle")
        .text(d => d.replace(/_/g, " "));

    // Draw radial areas for each response type
    const lineGenerator = d3.lineRadial()
        .radius(d => radiusScale(d.value))
        .angle((d, i) => angleScale(i));

    aggregatedData.forEach((responseData, responseIndex) => {
        const pathData = categories.map((category, i) => ({
            value: responseData.scores[i]
        }));

        radialGroup.append("path")
            .datum(pathData)
            .attr("fill", d3.schemeCategory10[responseIndex % 10])
            .attr("fill-opacity", 0.6)
            .attr("stroke", d3.schemeCategory10[responseIndex % 10])
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator)
            .on("mouseover", function (event) {
                // Make the area pop by increasing opacity and scaling
                d3.select(this)
                    .attr("fill-opacity", 0.9) // Increase opacity
                    .attr("transform", "scale(1.1)"); // Slightly scale up
                
                tooltip.style("opacity", 1)
                    .html(`<b>${responseData.response}</b><br>${categories.map((cat, i) =>
                        `${cat.replace(/_/g, " ")}: ${(responseData.scores[i] * 100).toFixed(2)}%`).join("<br>")}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 28}px`);
            })
            .on("mouseleave", function () {
                // Reset the area to its original state
                d3.select(this)
                    .attr("fill-opacity", 0.6) // Restore original opacity
                    .attr("transform", "scale(1)"); // Reset scaling
                
                tooltip.style("opacity", 0);
            });
    });

    // Add legend for responses
    const legend = radialChartGroup.append("g")
        .attr("transform", `translate(${radialWidth - 100}, ${50})`);

    legend.selectAll(".legend-item")
        .data(responses)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
            g.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

            g.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .text(d => d)
                .style("font-size", "12px");
        });
}

// Geospatial Chart
function createGeospatialChart(data) {
    const geoWidth = innerWidth;
    const geoHeight = innerHeight / 2;

    const projection = d3.geoMercator()
        .scale(120)
        .translate([geoWidth / 2, geoHeight / 1.5]);

    const path = d3.geoPath().projection(projection);

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then(geojson => {
            // Clear previous render
            geospatialChartGroup.selectAll("*").remove();

            // Aggregate data by country
            const aggregatedData = d3.rollups(
                data,
                v => ({
                    count: v.length,
                    treated: v.filter(d => d.treatment === "Yes").length,
                    untreated: v.filter(d => d.treatment === "No").length,
                }),
                d => d.Country
            );

            // Map aggregated data to GeoJSON features
            geojson.features.forEach(feature => {
                const countryName = feature.properties.name;
                const countryData = aggregatedData.find(([country]) => country === countryName);

                if (countryData) {
                    feature.properties.data = countryData[1]; // Attach data to feature
                } else {
                    feature.properties.data = null;
                }
            });

            // Draw the map
            const mapGroup = geospatialChartGroup.append("g");

            mapGroup.selectAll("path")
                .data(geojson.features)
                .join("path")
                .attr("d", path)
                .attr("fill", feature => feature.properties.data ? "#cce5ff" : "#e0e0e0")
                .attr("stroke", "#666")
                .on("mouseover", (event, feature) => {
                    if (feature.properties.data) {
                        const { treated, untreated, count } = feature.properties.data;
                        tooltip.style("opacity", 1)
                            .html(`
                                <b>${feature.properties.name}</b><br>
                                Total Responses: ${count}<br>
                                Treated: ${treated}<br>
                                Untreated: ${untreated}
                            `)
                            .style("left", `${event.pageX + 10}px`)
                            .style("top", `${event.pageY - 28}px`);
                    }
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mouseleave", () => tooltip.style("opacity", 0));

            // Add markers for countries with data
            mapGroup.selectAll("circle")
                .data(geojson.features.filter(f => f.properties.data))
                .join("circle")
                .attr("cx", d => projection(d3.geoCentroid(d))[0])
                .attr("cy", d => projection(d3.geoCentroid(d))[1])
                .attr("r", d => Math.sqrt(d.properties.data.count) * 2)
                .attr("fill", d => d.properties.data.treated > d.properties.data.untreated ? "#4CAF50" : "#F44336")
                .attr("stroke", "#000")
                .attr("stroke-width", 0.5)
                .on("mouseover", function (event, feature) {
                    const { treated, untreated, count } = feature.properties.data;
                
                    // Make the circle pop by scaling and changing stroke
                    d3.select(this)
                        .attr("r", d => Math.sqrt(d.properties.data.count) * 2.5) // Slightly increase radius
                        .attr("stroke-width", 1.5) // Increase stroke width
                        .attr("stroke", "#FFD700"); // Change stroke color to gold
                
                    // Show tooltip
                    tooltip.style("opacity", 1)
                        .html(`
                            <b>${feature.properties.name}</b><br>
                            Total Responses: ${count}<br>
                            Treated: ${treated}<br>
                            Untreated: ${untreated}
                        `)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mouseleave", function () {
                    // Reset circle to its original state
                    d3.select(this)
                        .attr("r", d => Math.sqrt(d.properties.data.count) * 2) // Reset radius
                        .attr("stroke-width", 0.5) // Reset stroke width
                        .attr("stroke", "#000"); // Reset stroke color
                
                    // Hide tooltip
                    tooltip.style("opacity", 0);
                });
            

            // Add legend for treated/untreated
            const legend = geospatialChartGroup.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${geoWidth - 150}, ${20})`);

            const legendData = [
                { label: "More Treated", color: "#4CAF50" },
                { label: "More Untreated", color: "#F44336" },
                { label: "No Data", color: "#e0e0e0" }
            ];

            legend.selectAll(".legend-item")
                .data(legendData)
                .join("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(0, ${i * 20})`)
                .call(g => {
                    g.append("rect")
                        .attr("width", 15)
                        .attr("height", 15)
                        .attr("fill", d => d.color);

                    g.append("text")
                        .attr("x", 20)
                        .attr("y", 12)
                        .text(d => d.label)
                        .style("font-size", "12px");
                });
        })
        .catch(error => console.error("Error loading GeoJSON:", error));
}
