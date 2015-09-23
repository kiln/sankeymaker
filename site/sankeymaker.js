var label_padding = 6,
    default_data_file = "data.json";

var defaultColor = d3.scale.category20();

// Parse query string parameters
var parameters = {};
(function (query, re, match) {
	while (match = re.exec(query)) {
		parameters[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
	}
})(window.location.search.substring(1).replace(/\+/g, "%20"), /([^&=]+)=?([^&]*)/g);

function overridePositions(sankey) {
	var nodes = sankey.nodes();
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.x_override) node.x = node.x_override * width / 100;
		if (node.y_override) node.y = node.y_override * height / 100;
	}
	sankey.relayout();
}

function makeDiagram(data, container_selector, width, height) {
	if (container_selector === undefined) container_selector = "body";
	if (width === undefined) width = 1000;
	if (height === undefined) height = 500;
	var svg = d3.select(container_selector).append("svg").attr("width", width).attr("height", height);

	var sankey = d3.sankey()
	    .size([width, height])
	    .nodeWidth(15)
	    .nodePadding(10)
	    .nodes(data.nodes)
	    .links(data.links)
	    .layout(32);
	overridePositions(sankey);

	var links = svg.selectAll(".link").data(sankey.links());
	links.enter().append("path").attr("class", "link");
	links
		.attr("d", sankey.link())
		.style("stroke-width", function(d) { return Math.max(1, d.dy); })
		.style("stroke", function(d) { return d.color; })
		.style("opacity", function(d) { return d.opacity; });

	function drag(d) {
		d.x = Math.max(0, Math.min(width - d.dx, d3.event.x));
		d.y = Math.max(0, Math.min(height - d.dy, d3.event.y));
		d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
		sankey.relayout();
		links.attr("d", sankey.link());
	}

	function dragend(d) {
		console.log(JSON.stringify({
			"x_override": d.x * 100 / width,
			"y_override": d.y * 100 / height
		}));
	}

	var nodes = svg.selectAll(".node").data(sankey.nodes());
	var nodes_enter = nodes.enter().append("g").attr("class", "node");
	nodes_enter.call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", drag)
      .on("dragend", dragend));

	nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	nodes_enter.append("rect");
	nodes.select("rect")
		.attr("width", function(d) { return d.dx; })
		.attr("height", function(d) { return d.dy; })
		.style("fill", function(d) { return d.color || defaultColor(d.name); })
		.style("stroke", function(d) { return d3.rgb(this.style.fill).darker(1); })
		.style("opacity", function(d) { return d.opacity; });

	nodes_enter.append("text");
	nodes.select("text")
		.text(function(d) { return d.name; })
		.style("opacity", function(d) { return d.label_opacity; })
		.attr("y", function(d) { return d.dy/2 + 6; })
		.attr("x", function(d) {
			if (d.x < width/2) return d.dx + label_padding;
			else return -label_padding;
		})
		.style("text-anchor", function(d) {
			if (d.x < width/2) return "start";
			else return "end";
		});
}
