var FILES = ["first.json", "second.json"];
var loaded_data = {},
    number_of_files_loaded = 0;
for (var i = 0; i < FILES.length; i++) {
	(function(url) {
		d3.json(url, function(data) {
			loaded_data[url] = data;
			number_of_files_loaded += 1;
			if (number_of_files_loaded == FILES.length) initSankey();
		});
	})(FILES[i]);
}

var sankey;
function initSankey() {
	sankey = Kiln.sankey("div").width(1200).height(500);
	sankey.data(loaded_data["first.json"]).draw();
}

// When you want to draw the second diagram, do this:
sankey.data(loaded_data["second.json"]).draw();
