HTMLWidgets.widget({

    name: 'iscatr',

    type: 'output',

    factory: function(el, width, height) {

        var inited = false;

        return {


            renderValue: function(x) { 
            //TODO: Make radius selectable.
            var radius = 5;

                if (!inited) {
                    inited = true;

                    // R gives us some data, but we need to convert that to locations on the 
                    // User's screen with the origin in the upper left corner.
                    // This means that the y axis needs to be flipped.
                    x_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.x)})
                    y_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.y)})
                    var x_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return d.x;})) - x_pad,
                            d3.max(x.data.map(function(d) {return d.x;})) + x_pad])
                        .range([0, width]);
                    var y_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return -d.y;})) - y_pad,
                            d3.max(x.data.map(function(d) {return -d.y;})) + y_pad])
                        .range([0, height]);


                    // Transform the data to viz coordinates.
                    init_vals = [];
                    for (let a of x.data) {
                        init_vals.push([a.x, a.y]);
                        a.x = x_ax(a.x);
                        a.y = y_ax(-a.y);
                    }

                    //add svg circles
                    var svgContainer = d3.select("#" + el.id).append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    var circles = svgContainer
                        .append("g")
                        .attr("class", "circles")
                        .selectAll("circle")
                        .data(x.data)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {return(d.x)})
                        .attr("cy", function(d) {return(d.y)})
                        .attr("title", function(d) {return(d.title)})
                        .attr("r", radius)
                    //TODO: Make fill selectable.
                        .attr("fill", function(d) {return(d.col)});

                    // When we drag a point, move that point
                    var moved_points = [];
                    var drag_handler = d3.drag()
                        .on("drag", function(d) {
                            d3.select(this)
                                .attr("cx", d.x = d3.event.x)
                                .attr("cy", d.y = d3.event.y);
                            d3.select("#label_" + d.title)
                                .attr("x", d.x + radius)
                                .attr("y", d.y + radius);
                        })
                    // When we stop dragging a point, record its new position
                        .on("end", function(d) {
                            //TODO: smarter about this. In particular, need to update, not add, if a point is already in the list, and need to get rid of the list when the button is pushed.
                            moved_points.push({'x' : x_ax.invert(d3.event.x), 
                                'y' : -y_ax.invert(d3.event.y),
                                'title' : this.__data__.title});
                            // send message to shiny
                            Shiny.onInputChange('cool_id', JSON.stringify(moved_points));
                        });



                    //apply the drag_handler to our circles
                    drag_handler(circles);

                    // Add Text Labels
                    svgContainer.selectAll("text")
                        .data(x.data)
                        .enter()
                        .append("text")
                        .text(function(d) {
                            return d.title;
                        })
                        .attr("x", function(d) {
                            return d.x + radius;  // Returns scaled location of x
                        })
                        .attr("y", function(d) {
                            return d.y + radius;  // Returns scaled circle y
                        })
                        .attr("id", function(d) {
                            return 'label_' + d.title;
                        })
                        .attr("font_family", "sans-serif")  // Font type
                        .attr("font-size", "11px")  // Font size
                        .attr("fill", "darkgreen");   // Font color

                    //Store the SVG so we can update it with new data.
                    el.svgContainer = svgContainer;

                } else {
                    // The logic for updating an existing plot

                    // R gives us some data, but we need to convert that to locations on the 
                    // User's screen with the origin in the upper left corner.
                    // This means that the y axis needs to be flipped.
                    x_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.x)})
                    y_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.y)})
                    var x_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return d.x;})) - x_pad,
                            d3.max(x.data.map(function(d) {return d.x;})) + x_pad])
                        .range([0, width]);
                    var y_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return -d.y;})) - y_pad,
                            d3.max(x.data.map(function(d) {return -d.y;})) + y_pad])
                        .range([0, height]);


                    // Transform the data to viz coordinates.
                    init_vals = [];
                    for (let a of x.data) {
                        init_vals.push([a.x, a.y]);
                        a.x = x_ax(a.x);
                        a.y = y_ax(-a.y);
                    }


                    // Update circles
                    el.svgContainer.selectAll("circle")
                        .data(x.data)  // Update with new data
                        .transition()  // Transition from old to new
                        .duration(1000)  // Length of animation
                        .delay(function(d, i) {
                            return i / x.data.length * 500;  // Dynamic delay (i.e. each item delays a little longer)
                        })
                        .attr("cx", function(d) {
                            return d.x;  // Circle's X
                        })
                        .attr("cy", function(d) {
                            return d.y;  // Circle's Y
                        })

                    // Update Text
                    el.svgContainer.selectAll("text")
                        .data(x.data)  // Update with new data
                        .transition()  // Transition from old to new
                        .duration(1000)  // Length of animation
                        .attr("x", function(d) {
                            return d.x + radius;  // Circle's X
                        })
                        .attr("y", function(d) {
                            return d.y + radius;  // Circle's Y
                        })

                }

            },

            resize: function(width, height) {

                // TODO: code to re-render the widget with a new size

            }

        };
    }
});
