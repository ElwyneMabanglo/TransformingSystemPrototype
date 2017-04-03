function dashboard(myId) {
//variable for auto reload segments
    var segmentIdList = [];
    var segmentTitles = [];

//chart configurations
    var id = myId;
    var radius_outer_thickness = 20;//spacing outside the outer band for text
    var radius_outer = 300; //radius of outer circle
    var radius = 150; //radius of inner circle
    var spacing = 20; //spacing for left and right separately
    var spacing_inner_text = 65;
    var outer_text_spacing = 20; //spacing for fitting the outermost text
    var c_width = radius_outer * 2;
    var center_x = radius + spacing * 2 / 2;
    var center_y = radius + spacing * 2 / 2;
    var levels = [20, 40, 68, 100]; //levels for the segments
    var border_color = "#D2DFEA";
    var border_width = 1;
    var hover_opacity = 0.4;
    var single_angle;
    var fontSize = 14;
    var fontWeight = "normal";
    var fontSizeOuter = 14;
    var fontWeightOuter = "bold";

    var outerCircleData = []; //2 to 5 is one group, 5 to 8 is another etc
    var innerCircleData = [];
    var unitsData = [];

    var radialPoints = [];

    var svg;
    var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.sections;
            });

    var pie_with_gap = d3.layout.pie()
            .sort(null)
            //            .padAngle(.1)
            .value(function (d) {
                return d.sections;
            });


    function calculateWidth() {
        //tidy up browser width
        var browser_width = $(window).width();

        //offset left menu
        browser_width -= 200;

        var cal_chartWidth = 0;

        var _width = 0;

        if (window.devicePixelRatio == 2) {
            var _width = (window.devicePixelRatio * $(window).width()) * 1.05;
        } else if (window.devicePixelRatio == 1.5) {
            var _width = (window.devicePixelRatio * $(window).width()) * 1.4
        } else {
            var _width = (window.devicePixelRatio * $(window).width()) * .90;
        }

        //var _width = window.screen.width * window.devicePixelRatio;
        if (browser_width <= 1280) {
            cal_chartWidth = (_width * .45) - 10;
            $("#" + id).width((_width * .45) - 10);
//        $("#results_container").width((_width * .55) - 10);
//        $("#results").height((_width * .45) - 10);
            radius_outer = cal_chartWidth / 2;
            c_width = radius_outer * 2;
            radius = radius_outer * .50;
            radius_outer_thickness = radius_outer * 0.09;
            spacing_inner_text = 65;
            fontSize = 12;
            fontWeight = "normal";
            fontSizeOuter = 12;
            fontWeightOuter = "bold";
        } else {
            radius_outer_thickness = radius_outer * 0.10;
            fontSize = 13;
            fontWeight = "normal";
            fontSizeOuter = 14;
            fontWeightOuter = "bold";
            spacing_inner_text = 100;
            //canvas will be 600
//            $("#canvas_container").width((_width *.45) - 10);
//            $("#results_container").width(_width  - 710);
//        $("#results").height(560);
//        $("#results").width(560)
        }
    }

    initSystemDashboard();

    function initSystemDashboard() {



        calculateWidth();

        d3.json("data.json", function (error, json) {
            if (error)
                return console.warn(error);
            var data = json;

            var parent, child_index = 0;

            for (var i = 0; i < data.length; i++) {


                var obj = data[i];
                //add parent json eg {id:0, sections: 4, color: "#ff00ff", title: "Attendances"}
                outerCircleData.push({id: i, sections: obj.childUnitList.length, colorFg: obj.colorCodeFg, colorBg: obj.colorCodeBg, title: obj.name});
//          outerCircleData.push({id: i, sections: obj.childUnitList.length, colorFg: obj.colorCodeFg, colorBg: obj.colorCodeBg, title: obj.name, childIds: _.map(obj.childUnitList, function(item){ return {"id": item.id, "title": item.name}})});

                segmentTitles[obj.id] = obj.name;


                for (var j = 0; j < obj.childUnitList.length; j++) {
                    var unit = obj.childUnitList[j];
                    segmentIdList.push({id: unit.id, name: unit.name});
                    segmentTitles[unit.id] = unit.name;
                    //add unit json eg {id:0, parent_section: 1, sections: 1, color: "#ff00ff", title: "A&E Attendances"}
                    innerCircleData.push({id: child_index, parent_section_id: i, sections: 1, title: unit.name, idLabel: unit.id, isEscalated: unit.escalated});

                    unitsData.push({id: child_index, parent_section_id: i, level: unit.currentLevel, colorFg: unit.colorCodeFg, colorBg: unit.colorCodeBg, isEscalated: unit.escalated});
                    child_index++;
                }
            }

            single_angle = Math.PI * 2 / child_index;

            for (var k = 0; k < child_index; k++) {
//                var x2=radius*Math.cos(single_angle*k);
//                var y2=radius*Math.sin(single_angle*k);
                var x2 = -Math.sin(single_angle * k) * (radius + spacing_inner_text / 3);
                var y2 = -Math.cos(single_angle * k) * (radius + spacing_inner_text / 3);
                radialPoints.push([x2, y2]);
            }

            initVisualize();
        });
    }

    function initVisualize() {

        //draw inner arcs
        initDrawingLayer();
        drawInnerArcsWithText();
        drawOuterArcsWithText();
        addData();
        drawBorders();
        drawInnerHoverArcs();
        drawOuterHoverArcs();

        //currentReloadIndex not defined?
    //if (currentReloadIndex >= 0) {
    //    currentShowingChildIds.push(segmentIdList[currentReloadIndex].id);
    //    d3.select("#canvas_container").select("g.innerArcs").selectAll("path.unit_section_" + currentReloadIndex).classed("notactive", false);
    //    d3.select("#canvas_container").select("g.innerArcs").selectAll("path.unit_section_" + currentReloadIndex).classed("active", true);
    //    d3.select("#canvas_container").select("g.innerArcs").selectAll("path.unit_section_" + currentReloadIndex).style("opacity", 1);
    //    d3.select("#canvas_container").select("g.data_highlight").select("path.child_section_" + currentReloadIndex).classed("active", true);
    //    $('#results_container').css('visibility', 'visible');
    //    loadPI(segmentIdList[currentReloadIndex].id);
    //}
    }

    function initDrawingLayer() {


        var size = c_width;

        svg = d3.select("#" + id).append("svg")
                .attr("width", (size))
                .attr("height", (size))
                .append("g")
                .attr("transform", "translate(" + (size) / 2 + "," + (size) / 2 + ")");
    }

    function drawInnerArcsWithText() {
        //drawing inner arcs
        var fullArc = d3.svg.arc()
                .outerRadius(radius);

        var innerArc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(0);

        var innerArcBg = d3.svg.arc()
                .outerRadius(radius_outer - radius_outer_thickness - outer_text_spacing)
                .innerRadius(0);

        var g_innerArcs = svg.append("g").attr("class", "innerArcs")
                .selectAll(".section")
                .data(pie(innerCircleData))
                .enter().append("g")
                .attr("class", function (d) {
                    return "section" + " unit_section_" + d.data.id + " parent_secion_" + d.data.parent_section_id;
                });

        g_innerArcs.append("path")
                .attr("class", function (d) {
                    return "section" + " unit_section_" + d.data.id + " parent_section_" + d.data.parent_section_id + " notactive";
                })
                .attr("d", innerArcBg)
                //                .attr("stroke", stroke_color)
                .attr("stroke-width", "0")
                .attr("fill", "white")
                .style("opacity", 0); //hide it by default, show on hover

//        var g_text = g_innerArcs.append("g").attr("class", "text").attr("transform", function (d) { //set the label's origin to the center of the arc
//            //we have to make sure to set these before calling arc.centroid
//            d.outerRadius = radius + spacing_inner_text; // Set Outer Coordinate
//            d.innerRadius = radius + spacing_inner_text; // Set Inner Coordinate
//            return "translate(" + fullArc.centroid(d) + ")";
//        });

//        var text = g_text.append("text")
//                .attr("class", function (d) {
//                    return "label label_parent_" + d.data.parent_section_id + " label_unit_" + d.data.id;
//                })
//                .style("font-weight", "bold")
//                .style("font-size", "13px")
//                .style("text-anchor", "middle")
//                .text(function (d) {
//                    return d.data.title.split(" ").join("\n");
//                });


        svg.append("g")
                .attr("class", "inner_labels")
                .selectAll("text")
                .data(pie(innerCircleData))
                .enter()
                .append("text")
                .style("font-size", fontSize + "px")
                .style("font-weight", fontWeight)
                .attr("class", function (d) {
                    return "svglabel label_parent_" + d.data.parent_section_id + " label_unit_" + d.data.id + " notactive";
                })
                .attr("text-anchor", "middle")
                .attr("dy", 0)
                .attr("transform", function (d) { //set the label's origin to the center of the arc
                    //we have to make sure to set these before calling arc.centroid
                    d.outerRadius = radius + spacing_inner_text; // Set Outer Coordinate
                    d.innerRadius = radius + spacing_inner_text; // Set Inner Coordinate
                    return "translate(" + fullArc.centroid(d) + ")";
                })
                .text(function (d) {
                    return d.data.title;
                });

        svg.append("g")
                .attr("class", "escalation_icons")
                .selectAll("text")
                .data(pie(innerCircleData))
                .enter()
                .append("text")
                .style("font-size", "10px")
                .style("font-weight", fontWeight)
                .style('font-family', 'FontAwesome')
                .style('fill', '#ff491f')
                .attr("class", function (d) {
                    return "svglabel icon_parent_" + d.data.parent_section_id + " icon_unit_" + d.data.id + " notactive";
                })
                .attr("text-anchor", "middle")
                .attr("dy", -23)
                .attr("transform", function (d) { //set the label's origin to the center of the arc
                    //we have to make sure to set these before calling arc.centroid
                    d.outerRadius = radius + spacing_inner_text; // Set Outer Coordinate
                    d.innerRadius = radius + spacing_inner_text; // Set Inner Coordinate
                    return "translate(" + fullArc.centroid(d) + ")";
                })
                .text(function (d) {
                    if (d.data.isEscalated)
                        return "\uf071";
                });

        d3.select("g.inner_labels").selectAll("text").call(wrap, 100);
    }


    function drawOuterArcsWithText() {
        var _data = pie_with_gap(outerCircleData);
        $.each(_data, function (index, item) {
            item.startAngle = item.startAngle + 0.008;
            item.endAngle = item.endAngle - 0.008;
        });

        //drawing outer arcs
        var outerArc = d3.svg.arc()
                .outerRadius(radius_outer - outer_text_spacing)
                .innerRadius(radius_outer - outer_text_spacing - radius_outer_thickness);

        var g_outerArcs = svg.append("g").attr("class", "outerArcs")
                .selectAll(".arc")
                .data(_data)
                .enter().append("path")
                .attr("class", function (d) {
                    return "parent_section parent_section_" + d.data.id + " notactive";
                })
                .attr("d", outerArc)
                .attr("fill", function (d) {
                    return d.data.colorBg;
                });

        var g_outerArcsTextPath = svg.append("g").attr("class", "outerArcsTextPath");


        g_outerArcsTextPath.selectAll("text").data(pie(outerCircleData))
                .enter().append("text")
                .attr("transform", function (d) {
                    var c = outerArc.centroid(d),
                            x = c[0],
                            y = c[1],
                            // pythagorean theorem for hypotenuse
                            h = Math.sqrt(x * x + y * y);
                    var spacing = outer_text_spacing - 3;
                    var a = (d.startAngle + d.endAngle) * 90 / Math.PI;
                    if (a > 90 && a < 270)
                        spacing -= 10;
                    return "translate(" + (x / h * (radius_outer - spacing)) + ',' + (y / h * (radius_outer - spacing)) + ")" + " rotate(" + angle(d) + ", 0, 0)";
                })
                //                .attr("dy", ".35em")
                .attr("class", function (d) {
                    return "svglabel label_parent_" + d.data.id + " notactive";
                })
                .style("font-weight", "bold")
                .style("font-size", "12px")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.data.title;
                });
    }


    function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI;
        if (a > 240)
            return a - 360;
        else if (a > 90)
            return a - 180;
        else
            return a;
        // return a > 90 ? a - 180 : a;
    }

    function drawBorders() {
        var borders = svg.append("g").attr("class", "borders");
        var g_circles = borders.append("g").attr("class", "circles")
                .selectAll("circle")
                .data(levels)
                .enter().append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", function (d) {
                    return radius * d / 100;
                })
                .attr("fill", "none")
                .attr("stroke-width", border_width)
                .attr("stroke", border_color);

        borders.selectAll("line")//---an empty selection---
                .data(radialPoints)
                .enter().append("svg:line")
                .attr("class", "line")
                //        .attr("x1",center_x)
                //        .attr("y1",center_y)
                .attr("x2", function (p) {
                    return p[0]
                })
                .attr("y2", function (p) {
                    return p[1]
                })
                .attr("stroke", border_color);

//        var innerArc = d3.svg.arc()
//                .outerRadius(radius)
//                .innerRadius(0);
//
//        var g_innerArcs = borders.append("g").attr("class", "innerArcs")
//                .selectAll("path")
//                .data(pie(innerCircleData))
//                .enter().append("path")
//                .attr("d", innerArc)
//                .attr("stroke", border_color)
//                .attr("stroke-width", border_width)
//                .attr("fill", "none");
    }

    function addData() {
        var innerArc = d3.svg.arc()
                .startAngle(function (data) {
                    return (data.id) * single_angle
                })
                .endAngle(function (data) {
                    return (data.id + 1) * single_angle
                })
                .outerRadius(function (data) {
                    return radius * levels[data.level - 1] / 100;
                })
                .innerRadius(function (data) {
                    if (data.level == 1)
                        return 0;
                    else
                        return radius * levels[data.level - 2] / 100;
                });
        svg.append("g").attr("class", "data_highlight")
                .selectAll("path")
                .data(unitsData)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "child_section_" + d.id + " parent_section_" + d.parent_section_id + " hideOnHover notactive";
                })
                .attr("d", innerArc)
                .attr("fill", function (d) {
                    return d.colorBg;
                })
                .attr("opacity", 0);
        // svg.append("g")
        //         .selectAll("p")
        //         .data(unitsData)
        //         .enter()
        //         .append("svg:foreignObject")
        //         .attr("width", 20)
        //         .attr("height", 20)
        //         .attr("y", function (d) {
        //             return radius;
        //         })
        //         .attr("x",function (d) {
        //             return radius;
        //         })
        //         .style("color", "#ff491f")
        //         .append("xhtml:span")
        //         .attr("class", function (d) {
        //             if(d.isEscalated){
        //                 return "glyphicon glyphicon-exclamation-sign";
        //             }
        //         });

        svg.append("g").attr("class", "data")
                .selectAll("path")
                .data(unitsData)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "child_section_" + d.id + " parent_section_" + d.parent_section_id + " hideOnHover notactive";
                })
                .attr("d", innerArc)
                .attr("fill", function (d) {
                    return d.colorBg;
                });
    }

    var _arcGrow = d3.svg.arc()
            .startAngle(function (data) {
                return (data.id) * single_angle
            })
            .endAngle(function (data) {
                return (data.id + 1) * single_angle
            })
            .outerRadius(function (data) {
                return (radius * levels[data.level - 1] / 100) + 10; //thickness of hightlight
            })
            .innerRadius(function (data) {
                if (data.level == 1)
                    return 0;
                else
                    return radius * levels[data.level - 2] / 100;
            });

    var _arcNormal = d3.svg.arc()
            .startAngle(function (data) {
                return (data.id) * single_angle
            })
            .endAngle(function (data) {
                return (data.id + 1) * single_angle
            })
            .outerRadius(function (data) {
                return (radius * levels[data.level - 1] / 100); //thickness of hightlight
            })
            .innerRadius(function (data) {
                if (data.level == 1)
                    return 0;
                else
                    return radius * levels[data.level - 2] / 100;
            });

    function drawInnerHoverArcs() {
        //drawing inner arcs
        var innerArc = d3.svg.arc()
                .outerRadius(radius_outer - radius_outer_thickness)
                .innerRadius(0);

        var g_innerArcs = svg.append("g").attr("class", "innerHoverArcs")
                .selectAll(".pie")
                .data(pie(innerCircleData))
                .enter().append("path")
                .attr("d", innerArc)
                .attr("fill", "white")
                .attr("stroke-width", 1)
                .attr("stroke", "blue")
                .attr("opacity", 0)
                .on("mouseover", function (d) {
                    svg.select("g.innerArcs").selectAll("path.notactive").style("opacity", hover_opacity);
                    svg.selectAll("g.data path.notactive").style("opacity", hover_opacity);
                    svg.select("g.data").select("path.child_section_" + d.data.id).style("opacity", 1);
                    svg.select("g.data_highlight").select("path.child_section_" + d.data.id).style("opacity", 0.3);

                    svg.select("g.data_highlight").select("path.child_section_" + d.data.id + ".notactive").transition().duration(200)
                            .attr('d', function (d) {
                                return _arcGrow(d);
                            });
                    svg.select("g.innerArcs").select("path.unit_section_" + d.data.id + ".notactive").transition().duration(300).style("opacity", 1);

                    svg.select("g.inner_labels").selectAll("text.svglabel.notactive").style("opacity", hover_opacity);
                    svg.select("g.inner_labels").selectAll("text.label_unit_" + d.data.id + ".notactive").style("opacity", 1);
                })
                .on("mouseout", function (d) {
                    svg.selectAll("g.data_highlight path.notactive").style("opacity", 0);
                    svg.selectAll("g.data path").style("opacity", 1);

                    svg.select("g.data_highlight").select("path.child_section_" + d.data.id + ".notactive").transition().duration(100)
                            .attr('d', function (d) {
                                return _arcNormal(d);
                            });
                    svg.selectAll("g.innerArcs path.notactive").transition().duration(300).style("opacity", 0);

                    svg.select("g.inner_labels").selectAll("text.svglabel").style("opacity", 1);
                })
                .on("click", function (d) {


                    //Load JSON - https://api.jquery.com/jquery.getjson/
                    var jqxhr = $.getJSON("data.json", function () {
                        console.log("success");
                    })

                    .done(function (j) {
                        console.log("second success");

                        var content = "<table data-role='table' class='ui-responsive ui-shadow'>";
                        content += "<tr><th>Name</th><th>Description</th><th>Alert Level</th></tr>";

                        let i;
                        for (i = 0; i < j.length; i++) {
                            let o = j[i];
                            if (o.childUnitList[0].id == d.data.idLabel) {
                                content += "<tr>";
                                content += "<td>" + o.childUnitList[0].name + "</td>";
                                content += "<td>" + o.childUnitList[0].siteName + "</td>";
                                content += "<td>" + o.childUnitList[0].alertLevel + "</td>";
                                content += "</tr>";
                            }
                        }

                        content += "</table>"
                        $('#results').html(content);
                    })

                     .fail(function () {
                         console.log("error");
                     })




                    //var _idLabel = d.data.idLabel;
                    //var index = currentShowingChildIds.indexOf(_idLabel);
                    //if (index > -1) {
                    //    currentShowingChildIds.splice(index, 1);
                    //    //$("#ind_info_"+_idLabel).remove();
                    //    removePI(_idLabel);
                    //    updateActionBar(_idLabel);
                    //    svg.select("g.inner_labels").selectAll("text.label_unit_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.inner_labels").selectAll("text.label_unit_" + d.data.id).classed("active", false);
                    //    svg.select("g.innerArcs").select("path.unit_section_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.innerArcs").select("path.unit_section_" + d.data.id).classed("active", false);
                    //    svg.select("g.data").select("path.child_section_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.data").select("path.child_section_" + d.data.id).classed("active", false);
                    //    svg.select("g.data_highlight").select("path.child_section_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.data_highlight").select("path.child_section_" + d.data.id).classed("active", false);
                    //} else {
                    //    svg.select("g.inner_labels").selectAll("text.label_unit_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.inner_labels").selectAll("text.label_unit_" + d.data.id).classed("active", true);
                    //    svg.select("g.innerArcs").select("path.unit_section_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.innerArcs").select("path.unit_section_" + d.data.id).classed("active", true);
                    //    svg.select("g.data").select("path.child_section_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.data").select("path.child_section_" + d.data.id).classed("active", true);
                    //    svg.select("g.data_highlight").select("path.child_section_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.data_highlight").select("path.child_section_" + d.data.id).classed("active", true);
                    //    currentShowingChildIds.push(_idLabel);
                    //    $('#results_container').css('visibility', 'visible');
                    //    loadPI(d.data.idLabel);
                    //}
                });
    }

    function drawOuterHoverArcs() {
        //drawing inner arcs
        var outerArc = d3.svg.arc()
                .outerRadius(radius_outer)
                .innerRadius(radius_outer - radius_outer_thickness - outer_text_spacing);

        var g_innerArcs = svg.append("g").attr("class", "outerHoverArcs")
                .selectAll(".pie")
                .data(pie(outerCircleData))
                .enter().append("path")
                .attr("d", outerArc)
                .attr("fill", "white")
                .attr("stroke-width", 1)
                .attr("stroke", "blue")
                .attr("opacity", 0)
                .on("mouseover", function (d) {
                    svg.selectAll("g.data path.notactive").style("opacity", hover_opacity);
                    svg.select("g.data").selectAll("path.parent_section_" + d.data.id).style("opacity", 1);
                    svg.select("g.innerArcs").selectAll("path.parent_section_" + d.data.id + ".notactive").transition().duration(300).style("opacity", 1);
                    svg.select("g.outerArcs").selectAll("path.parent_section" + ".notactive").style("opacity", hover_opacity);
                    svg.select("g.outerArcs").select("path.parent_section_" + d.data.id).style("opacity", 1);

                    svg.select("g.outerArcsTextPath").selectAll("text.svglabel" + ".notactive").style("opacity", hover_opacity);
                    svg.select("g.outerArcsTextPath").selectAll("text.label_parent_" + d.data.id).style("opacity", 1);
                    svg.select("g.inner_labels").selectAll("text.svglabel" + ".notactive").style("opacity", hover_opacity);
                    svg.select("g.inner_labels").selectAll("text.label_parent_" + d.data.id).style("opacity", 1);
                    //grow pies
//                    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.parent_section_id+".notactive").style("opacity", 0.3);
                    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id + ".notactive").transition().duration(200)
                            .attr('d', function (d) {
                                return _arcGrow(d);
                            })
                            .style("opacity", 0.3);

                })
                .on("mouseout", function (d) {
                    svg.selectAll("g.data path").style("opacity", 1);
                    svg.selectAll("g.innerArcs path" + ".notactive").transition().duration(300).style("opacity", 0);
                    svg.select("g.outerArcs").selectAll("path.parent_section").style("opacity", 1);

                    svg.select("g.outerArcsTextPath").selectAll("text.svglabel").style("opacity", 1);
                    svg.select("g.inner_labels").selectAll("text.svglabel").style("opacity", 1);
                    //reduce pies
                    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id + ".notactive").transition().duration(200)
                            .attr('d', function (d) {
                                return _arcNormal(d);
                            })
                            .style("opacity", 0);
                })
                .on("click", function (d) {

                    //Load JSON - https://api.jquery.com/jquery.getjson/
                    var jqxhr = $.getJSON("data.json", function () {
                        console.log("success");
                    })

                    .done(function (j) {
                        console.log("second success");

                        var content = "<table data-role='table' class='ui-responsive ui-shadow'>";
                        content += "<tr><th>Name</th><th>Description</th><th>Site</th></tr>";

                        let i;
                            for (i = 0; i < j.length; i++) {
                                let o = j[i];
                                if (o.name == d.data.title) {
                                    content += "<tr>";
                                    content += "<td>" + o.name + "</td>";
                                    content += "<td>" + o.description + "</td>";
                                    content += "<td>" + o.siteName + "</td>";
                                    content += "</tr>";
                                }
                            }

                            content += "</table>"                     
                            $('#results').html(content);
                    })

                     .fail(function () {
                        console.log("error");
                     })

                    //var _idParentLabel = d.data.id;
                    //var index = currentShowingParentIds.indexOf(_idParentLabel);
                    //if (index > -1) {
                    //    currentShowingParentIds.splice(index, 1);
                    //    //remove all its childs
                    //    _.each(d.data.childIds, function (i) {
                    //        var _index = currentShowingChildIds.indexOf(i.id);
                    //        if (_index > -1) {
                    //            currentShowingChildIds.splice(_index, 1);
                    //            $("#ind_info_" + i.id).remove();
                    //            removePI(i.id);
                    //            updateActionBar(i.id);
                    //        }
                    //    });

                    //    svg.select("g.outerArcsTextPath").selectAll("text.label_parent_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.outerArcsTextPath").selectAll("text.label_parent_" + d.data.id).classed("active", false);
                    //    svg.select("g.outerArcs").select("path.parent_section_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.outerArcs").select("path.parent_section_" + d.data.id).classed("active", false);

                    //    //set corresponding inner labels to active
                    //    svg.select("g.inner_labels").selectAll("text.label_parent_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.inner_labels").selectAll("text.label_parent_" + d.data.id).classed("active", false);
                    //    svg.select("g.innerArcs").selectAll("path.parent_section_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.innerArcs").selectAll("path.parent_section_" + d.data.id).classed("active", false);
                    //    svg.select("g.data").selectAll("path.parent_section_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.data").selectAll("path.parent_section_" + d.data.id).classed("active", false);
                    //    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id).classed("notactive", true);
                    //    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id).classed("active", false);
                    //    //grow pie
                    //    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id).transition().duration(200)
                    //            .attr('d', function (d) {
                    //                return _arcNormal(d);
                    //            })
                    //            .style("opacity", 0);
                    //} else {
                    //    currentShowingParentIds.push(_idParentLabel);
                    //    $('#results_container').css('visibility', 'visible');
                    //    _.each(d.data.childIds, function (i) {
                    //        var _index = currentShowingChildIds.indexOf(i.id);
                    //        if (_index > -1) {
                    //            currentShowingChildIds.splice(_index, 1);
                    //            $("#ind_info_" + i.id).remove();
                    //        }
                    //        currentShowingChildIds.push(i.id);
                    //        loadPI(i.id);
                    //    });

                    //    svg.select("g.outerArcsTextPath").selectAll("text.label_parent_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.outerArcsTextPath").selectAll("text.label_parent_" + d.data.id).classed("active", true);
                    //    svg.select("g.outerArcs").select("path.parent_section_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.outerArcs").select("path.parent_section_" + d.data.id).classed("active", true);

                    //    //set corresponding inner labels to active
                    //    svg.select("g.inner_labels").selectAll("text.label_parent_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.inner_labels").selectAll("text.label_parent_" + d.data.id).classed("active", true);
                    //    svg.select("g.innerArcs").selectAll("path.parent_section_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.innerArcs").selectAll("path.parent_section_" + d.data.id).classed("active", true);
                    //    svg.select("g.data").selectAll("path.parent_section_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.data").selectAll("path.parent_section_" + d.data.id).classed("active", true);
                    //    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id).classed("notactive", false);
                    //    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id).classed("active", true);
                    //    //grow pie
                    //    svg.select("g.data_highlight").selectAll("path.parent_section_" + d.data.id).transition().duration(200)
                    //            .attr('d', function (d) {
                    //                return _arcGrow(d);
                    //            })
                    //            .style("opacity", 0.3);
                    //}
                });
    }

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
                }
            }
        });
    }
}