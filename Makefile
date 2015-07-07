site/data.json: bin/process-data.py data/Sankey_siteA_node_sizes.csv data/Sankey_SiteA_start_at_beginning.csv
	$^ > "$@"
