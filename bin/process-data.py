#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

import csv
import json
import re
import sys

# Should we have a dummy outflow node for every real node that needs one,
# or a single dummy outflow node that receives unaccounted-for outflows
# from everywhere.
JUST_ONE_DUMMY_OUTFLOW_NODE = False

nodes_filename, edges_filename = sys.argv[1:]

def each_csv_row(filename):
	with open(filename, 'r') as f:
		r = csv.reader(f)
		header = r.next()
		for row in r:
			yield dict(zip(header, row))

nodes = []
node_index_by_name = {}
for node in each_csv_row(nodes_filename):
	name = node.pop("source")
	index = len(nodes)
	node_index_by_name[name] = index
	output_node = {
		"name": name,
		"width": float(node["width"]),
	}
	if node.get("xpos"):
		output_node["x_override"] = float(node["xpos"])
	if node.get("ypos"):
		output_node["y_override"] = float(node["ypos"])
	if node.get("node_colour"):
		color_string = node["node_colour"]
		mo = re.match(r"^(\d+) (\d+) (\d+)$", color_string)
		if mo:
			output_node["color"] = "rgb({},{},{})".format(*mo.groups())
		else:
			output_node["color"] = color_string
	if node.get("node_opacity"):
		output_node["opacity"] = float(node["node_opacity"]) / 100
	nodes.append(output_node)

outflows = {}
inflows = {}
edges = []
for edge in each_csv_row(edges_filename):
	value = edge["value"] = float(edge["value"])
	edge["source"] = source_index = node_index_by_name[edge["source"]]
	edge["target"] = target_index = node_index_by_name[edge["target"]]
	outflows[source_index] = outflows.get(source_index, 0) + value
	inflows[target_index] = inflows.get(target_index, 0) + value
	edges.append(edge)

has_dummy_outflow_node = False
for i, node in enumerate(nodes):
	inflow = inflows.get(i, 0)
	outflow = outflows.get(i, 0)
	if 0 < inflow < outflow:
		dummy_node_index = len(nodes)
		nodes.append({
			"name": ""
		})
		edges.append({
			"source": dummy_node_index,
			"target": i,
			"value": outflow - inflow
		})
	elif 0 < outflow < inflow:
		if has_dummy_outflow_node:
			dummy_node_index = len(nodes) - 1
		else:
			dummy_node_index = len(nodes)
			nodes.append({
				"name": "",
				"opacity": 0
			})
			if JUST_ONE_DUMMY_OUTFLOW_NODE:
				has_dummy_outflow_node = True
		edges.append({
			"source": i,
			"target": dummy_node_index,
			"value": inflow - outflow,
			"opacity": 0
		})

json.dump({
	"nodes": nodes,
	"links": edges,
}, sys.stdout, indent=4)
