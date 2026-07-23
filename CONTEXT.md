# JSON Import & Export

JSON Import & Export moves structured JSON data into Google Sheets and turns
tabular sheet data back into JSON.

## Language

**JSON Document**:
One uploaded JSON file containing either a single record or an ordered record set.
_Avoid_: Payload, blob

**Record**:
One JSON object represented by one data row during import or export.
_Avoid_: Item, entry

**Record Set**:
An ordered collection of records. A JSON object forms a one-record set; a
top-level JSON array forms a multi-record set.
_Avoid_: Dataset, list

**Field Path**:
A dot-separated name locating a value within a record. Numeric path segments
identify array positions.
_Avoid_: JSONPath, key

**Header**:
A spreadsheet cell in the first row of tabular data that contains a field path.
_Avoid_: Column name, key

**Tabular Data**:
A rectangular sheet range whose first row contains headers and whose remaining
rows represent records.
_Avoid_: Table, grid

**Import**:
The operation that converts one or more JSON documents into tabular data at an
import destination.
_Avoid_: Upload

**Export**:
The operation that converts tabular data from a sheet or selection into a JSON
record set.
_Avoid_: Download

**Import Destination**:
The sheet and starting cell where imported tabular data will be written.
_Avoid_: Target, output

**Selection**:
The active spreadsheet range or cell used as an import destination or export
source.
_Avoid_: Cursor

**Merge**:
The option that combines records from multiple JSON documents into one record
set before import.
_Avoid_: Join, concatenate
