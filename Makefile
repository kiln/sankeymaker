all: site/sankey.js site/data.json

.PHONY: all

site/sankey.js: ../d3-plugins/sankey/sankey.js
	cp "$<" "$@"

site/data.json: bin/process-data.py data/Sankey_siteA_node_sizes.csv data/Sankey_SiteA_start_at_beginning.csv
	$^ > "$@"
