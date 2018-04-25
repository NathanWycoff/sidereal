HTMLWidgets.widget({

    name: 'iscatr',

    type: 'output',

    factory: function(el, width, height) {

        var inited = false;

        return {


            renderValue: function(x) { 

                if (!inited) {
                    inited = true;

                    // Make the plot square by taking the min of the height and the width to be both.
                    el.plot_size = d3.min([height, width]);

                    // R gives us some data, but we need to convert that to locations on the 
                    // User's screen with the origin in the upper left corner.
                    // This means that the y axis needs to be flipped.
                    x_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.x)})
                    y_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.y)})
                    var x_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return d.x;})) - x_pad,
                            d3.max(x.data.map(function(d) {return d.x;})) + x_pad])
                        .range([0, el.plot_size]);
                    var y_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return -d.y;})) - y_pad,
                            d3.max(x.data.map(function(d) {return -d.y;})) + y_pad])
                        .range([0, el.plot_size]);


                    // Transform the data to viz coordinates.
                    init_vals = [];
                    for (let a of x.data) {
                        init_vals.push([a.x, a.y]);
                        a.x = x_ax(a.x);
                        a.y = y_ax(-a.y);
                    }

                    //add svg circles
                    var svgContainer = d3.select("#" + el.id).append("svg")
                        .attr("width", el.plot_size)
                        .attr("height", el.plot_size);

                    var circles = svgContainer
                        .append("g")
                        .attr("class", "circles")
                        .selectAll("circle")
                        .data(x.data)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {return(d.x)})
                        .attr("cy", function(d) {return(d.y)})
                        .attr("title", function(d) {return(d.name)})//TODO: Check what exactly this line does.
                        .attr("rid", function(d) {return(d.rid)})
                        .attr("r", function(d) {return(d.radius)})
                        .attr("fill", function(d) {return(d.col)});

                    // When we drag a point, move that point
                    el.moved_points = [];
                    var drag_handler = d3.drag()
                        .on("drag", function(d) {
                            d3.select(this)
                                .attr("cx", d.x = d3.event.x)
                                .attr("cy", d.y = d3.event.y);
                            d3.select("#label_" + d.rid)
                                .attr("x", d.x + d.radius)
                                .attr("y", d.y + d.radius);
                        })
                    // When we stop dragging a point, record its new position
                        .on("end", function(d) {
                            // Update a points location if it's already recorded, add it to the array if it's not yet been recorded.
                            ind = el.moved_points.findIndex(x => x.rid == d.rid);
                            if (ind >= 0) {
                                el.moved_points[ind] = {'x' : x_ax.invert(d3.event.x), 
                                'y' : -y_ax.invert(d3.event.y),
                                'rid' : d.rid};
                            } else {
                                el.moved_points.push({'x' : x_ax.invert(d3.event.x), 
                                    'y' : -y_ax.invert(d3.event.y),
                                    'rid' : d.rid});
                            }

                            // Give shiny the updated thing.
                            Shiny.onInputChange('moved_points', JSON.stringify(el.moved_points));
                        });



                    //apply the drag_handler to our circles
                    drag_handler(circles);

                    // Add Text Labels
                    svgContainer.selectAll("text")
                        .data(x.data)
                        .enter()
                        .append("text")
                        .text(function(d) {
                            return d.name;
                        })
                        .attr("x", function(d) {
                            return d.x + d.radius;  // Returns scaled location of x
                        })
                        .attr("y", function(d) {
                            return d.y + d.radius;  // Returns scaled circle y
                        })
                        .attr("id", function(d) {
                            return 'label_' + d.rid;
                        })
                        .attr("font_family", "sans-serif")  // Font type
                        .attr("font-size", "11px")  // Font size
                        .attr("fill", "darkgreen");   // Font color

                    //Store the SVG so we can update it with new data.
                    el.svgContainer = svgContainer;

                } else {
                    // The logic for updating an existing plot

                    // Flush the currently selected points.
                    el.moved_points = [];

                    // R gives us some data, but we need to convert that to locations on the 
                    // User's screen with the origin in the upper left corner.
                    // This means that the y axis needs to be flipped.
                    x_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.x)})
                    y_pad = 0.5 * d3.deviation(x.data, function(d) {return(d.y)})
                    var x_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return d.x;})) - x_pad,
                            d3.max(x.data.map(function(d) {return d.x;})) + x_pad])
                        .range([0, el.plot_size]);
                    var y_ax = d3.scaleLinear()
                        .domain([d3.min(x.data.map(function(d) {return -d.y;})) - y_pad,
                            d3.max(x.data.map(function(d) {return -d.y;})) + y_pad])
                        .range([0, el.plot_size]);


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
                            return d.x + d.radius;  // Circle's X
                        })
                        .attr("y", function(d) {
                            return d.y + d.radius;  // Circle's Y
                        })

                }

            },

            resize: function(width, height) {

                // TODO: code to re-render the widget with a new size

            }

        };
    }
});
