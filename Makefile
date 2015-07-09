all: site/sankey.js site/data.json site/20150709.json

.PHONY: all

site/sankey.js: ../d3-plugins/sankey/sankey.js
	cp "$<" "$@"

site/data.json: bin/process-data.py data/Sankey_siteA_node_sizes.csv data/Sankey_SiteA_start_at_beginning.csv
	$^ > "$@"

site/20150709.json: bin/process-data.py data/Sankey_siteA_node_sizes_manual.csv data/Sankey_SiteA_start_at_beginning_2015_7_9.csv
	$^ > "$@"
