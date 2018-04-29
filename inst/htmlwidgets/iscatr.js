HTMLWidgets.widget({

    name: 'iscatr',

    type: 'output',

    factory: function(el, width, height) {

        var inited = false;

        Shiny.addCustomMessageHandler("changeMode", changeMode);

        // this function is called by the handler, which passes the message
        el.mode = "read";
        function changeMode(mode){
            el.mode = mode;
            console.log("Mode is now:");
            console.log(el.mode);
        }

        // Initialize some color based functions
        // Credit to SE user Greg at https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
        function colourNameToHex(colour)
        {
            var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
                "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
                "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
                "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
                "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
                "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
                "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
                "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
                "honeydew":"#f0fff0","hotpink":"#ff69b4",
                "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
                "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
                "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
                "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
                "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
                "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
                "navajowhite":"#ffdead","navy":"#000080",
                "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
                "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
                "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
                "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
                "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
                "violet":"#ee82ee",
                "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
                "yellow":"#ffff00","yellowgreen":"#9acd32"};

            if (typeof colours[colour.toLowerCase()] != 'undefined')
                return colours[colour.toLowerCase()];

            return false;
        }

        //Credit to SE user Onur Yildirim
        function invertColor(hex) {
            if (hex.indexOf('#') === 0) {
                hex = hex.slice(1);
            }
            // convert 3-digit hex to 6-digits.
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            if (hex.length !== 6) {
                throw new Error('Invalid HEX color.');
            }
            // invert color components
            var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
                g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
                b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
            // pad each with zeros and return
            return '#' + padZero(r) + padZero(g) + padZero(b);
        }

        function padZero(str, len) {
            len = len || 2;
            var zeros = new Array(len).join('0');
            return (zeros + str).slice(-len);
        }

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
                        .attr("fill", function(d) {return(d.col)})
                        .attr("touched", "no")
                        .on('mouseover', function(d) {// On mouseover, display a shadown on where the point used to be.
                            console.log("yeah boi");
                            if (d.hasOwnProperty('last_x')) {
                                console.log("yeah boisss");
                                console.log(d.last_x);
                                console.log(d.last_y);
                                // Draw a shadow point
                                svgContainer.append("circle")
                                    .attr("cx", d.last_x)
                                    .attr("cy", d.last_y)
                                    .attr("r", 1.5 * d.radius)
                                    .attr("fill", "grey")
                                    .attr("id", "last_point" + d.rid);

                                // Draw a line connecting shadow point and present point
                                svgContainer.append("line")
                                    .attr("x1", d.last_x)
                                    .attr("y1", d.last_y)
                                    .attr("x2", d.last_x)
                                    .attr("y2", d.last_y)
                                    .attr("stroke-width", 2)
                                    .attr("stroke", "grey")
                                    .attr("id", "last_line" + d.rid)
                                    .transition()
                                    .duration(200)
                                    .attr("x2", d.x)
                                    .attr("y2", d.y);
                            }
                        })
                        .on('mouseout', function(d) {// Delete that shadown when the mouse moves.
                            if (d.hasOwnProperty('last_x')) {
                                d3.select("#last_point" + d.rid).remove();
                                d3.select("#last_line" + d.rid).remove();
                            }
                        })
                        .on('dblclick', function(d) {
                            if (el.mode === "read") {
                                Shiny.onInputChange('text_contents', d.longtext);
                            }
                        });

                    // When we drag a point, move that point
                    el.moved_points = [];
                    var drag_handler = d3.drag()
                        .on("start", function(d) {
                            if (el.mode === "int") {
                                d3.select(this)
                                    .attr("stroke", invertColor(colourNameToHex(d.col)))
                                    .attr("touched", "yes")
                                    .attr("stroke-width", 2);
                            }
                        })
                        .on("drag", function(d) {
                            if (el.mode === "int") {
                                d3.select(this)
                                    .attr("cx", d.x = d3.event.x)
                                    .attr("cy", d.y = d3.event.y);
                                d3.select("#label_" + d.rid)
                                    .attr("x", d.x + d.radius)
                                    .attr("y", d.y + d.radius);
                            }
                        })
                    // When we stop dragging a point, record its new position
                        .on("end", function(d) {
                            // Update a points location if it's already recorded, add it to the array if it's not yet been recorded.
                            if (el.mode === "int") {
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
                            }
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


                    // Transform the data to viz coordinates; help the point remember its previous location.
                    // TODO: This next block is duplicated in code. It should instead be a function hwich is called twice.
                    init_vals = [];//TODO: init_vals no longer needed.
                    for (let a of x.data) {
                        init_vals.push([a.x, a.y]);

                        a.x = x_ax(a.x);
                        a.y = y_ax(-a.y);
                        a.last_x = x_ax(a.last_x);
                        a.last_y = y_ax(-a.last_y);
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
                        .attr("fill", function(d) {
                            if (d3.select(this).attr("touched") == "yes") {
                                d3.select(this).attr("touched", "no");
                                return invertColor(colourNameToHex(d.col));
                            } else {
                                return d.col;
                            }
                        })
                        .attr("stroke-width", 0)
                        .attr("stroke", "black");

                    // Update Text labels
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
