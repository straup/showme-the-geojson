Show me the GeoJSON
--

Show me the GeoJSON is a bespoke web application for loading and displaying
GeoJSON files on a map. Like this:

http://straup.github.com/showme-the-geojson/

It can load remote GeoJSON files (assuming that the host they are being served
from has enabled CORS support).

On browsers that support the File API it can load GeoJSON files locally from
disk. (For intents and purposes this means Firefox and Opera at the moment.)

As each GeoJSON document is loaded the map is zoomed to the maximum extent of
all the features (points, polygons, etc.) listed in all the documents. As you
mouse over each feature any properties defined for that element will be
displayed in the sidebar on the left-hand side. If you click on a feature any
properties will be displayed in a modal dialog for easy copy-pasting.

By default, Show Me the GeoJSON is meant to run as a stand-alone web application
although it can also be embedded in a web page with other stuff. Like this page,
for example. Take a look at the source code for details.

It currently lacks the necessary spit and polish in the visual design and colour
palette departments but otherwise works. It doesn't do much but then again it
isn't meant to either.
