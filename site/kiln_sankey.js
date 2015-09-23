if (!window.hasOwnProperty("Kiln")) window.Kiln = {};
Kiln.sankey = (function() {
	var VERSION = "0.1";

	function Sankey(selector) {
		this.container = d3.select(selector);
		if (this.container.empty()) throw "Selector did not match: " + selector;

		this._data = { nodes: [], links: [] };
		this._width = 1000;
		this._height = 500;
		this._labelPadding = 20;
		this._draggable = false;
	}

	// Create accessor methods for all the _parameters defined by the constructor
	function accessor(proto, k) {
		if (k.length > 0 && k.charAt(0) == "_") {
			proto[k.substr(1)] = function(v) {
				if (typeof v == "undefined") return this[k];
				this[k] = v;
				return this;
			};
		}
	}
	for (var k in new Sankey("*")) {
		accessor(Sankey.prototype, k);
	}

	var defaultColor = d3.scale.category20();

	Sankey.prototype._overridePositions = function Sankey__overridePositions() {
		var nodes = this.sankey.nodes();
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.x_override) node.x = node.x_override * this._width / 100;
			if (node.y_override) node.y = node.y_override * this._height / 100;
		}
		this.sankey.relayout();
	}

	Sankey.prototype.draw = function Sankey_draw() {
		this.container.select("svg").remove();
		var svg = this.container.append("svg").attr("width", width).attr("height", height);

		var sankey = this.sankey = d3.sankey()
			.size([width, height])
			.nodeWidth(15)
			.nodePadding(10)
			.nodes(this._data.nodes)
			.links(this._data.links)
			.layout(32);

		this._overridePositions();

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
		if (this._draggable) {
			nodes_enter.call(d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("dragstart", function() { this.parentNode.appendChild(this); })
				.on("drag", drag)
				.on("dragend", dragend));
		}

		nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		nodes_enter.append("rect");
		nodes.select("rect")
			.attr("width", function(d) { return d.dx; })
			.attr("height", function(d) { return d.dy; })
			.style("fill", function(d) { return d.color || defaultColor(d.name); })
			.style("stroke", function(d) { return d3.rgb(this.style.fill).darker(1); })
			.style("opacity", function(d) { return d.opacity; });

		nodes_enter.append("text");
		var that = this;
		nodes.select("text")
			.text(function(d) { return d.name; })
			.style("opacity", function(d) { return d.label_opacity; })
			.attr("y", function(d) { return d.dy/2 + 6; })
			.attr("x", function(d) {
				if (d.x < width/2) return d.dx + that._labelPadding;
				else return -that._labelPadding;
			})
			.style("text-anchor", function(d) {
				if (d.x < width/2) return "start";
				else return "end";
			});
	};

	function Kiln_sankey(selector) {
		return new Sankey(selector);
	}
	Kiln_sankey.version = VERSION;

	return Kiln_sankey;
})();
