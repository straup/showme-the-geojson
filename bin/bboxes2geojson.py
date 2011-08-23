#!/usr/bin/env python

import sys
import csv
import json

csvfile = sys.argv[1]
reader = csv.DictReader(open(csvfile, 'r'))

features = []

for row in reader:

    for k, v in row.items():
        row[k] = float(v)

    bbox = [row['swlon'], row['swlat'], row['nelon'], row['nelat']]
    coords = [
        [row['swlon'], row['swlat']],
        [row['nelon'], row['swlat']],
        [row['nelon'], row['nelat']],
        [row['swlon'], row['nelat']],
        [row['swlon'], row['swlat']],
        ]

    for prop in ('swlat', 'swlon', 'nelat', 'nelon'):
        del(row[prop])

    features.append({
            'type' : 'Feature',
            'bbox' : bbox,
            'properties' : row,
            'geometry' : {
                'type' : 'Polygon',
                'coordinates' : [ coords ]
                }
            })

geojson = {
    'type' : 'FeatureCollection',
    'features' : features
}

print json.dumps(geojson)
