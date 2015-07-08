#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

import csv
import json
import sys

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
	nodes.append({
		"name": name,
		"width": float(node["width"])
	})

outflows = {}
inflows = {}
edges = []
for edge in each_csv_row(edges_filename):
	value = edge["value"] = float(edge["value"])
	edge["source"] = source_index = node_index_by_name[edge["source"]]
	edge["target"] = target_index = node_index_by_name[edge["target"]]
	outflows[source_index] = outflows.get(source_index, 0) + value
	inflows[target_index] = outflows.get(target_index, 0) + value
	edges.append(edge)

for i, node in enumerate(nodes):
	inflow = inflows.get(i, 0)
	outflow = outflows.get(i, 0)
	if inflow < outflow:
		dummy_node_index = len(nodes)
		nodes.append({
			"name": "inflow mismatch from " + str(i)
		})
		edges.append({
			"source": dummy_node_index,
			"target": i,
			"value": outflow - inflow
		})
	elif outflow < inflow:
		dummy_node_index = len(nodes)
		nodes.append({
			"name": "outflow mismatch from " + str(i)
		})
		edges.append({
			"source": i,
			"target": dummy_node_index,
			"value": inflow - outflow
		})

json.dump({
	"nodes": nodes,
	"links": edges,
}, sys.stdout)
