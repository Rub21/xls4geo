# xlsx4geo

### Install

 ```
 git clone https://github.com/Rub21/xlsx4geo.github.com
 cd xlsx4geo/
 npm link
 ```
 
### Usage

- Wild data

Convert all sheets from xlsx into CSV files.

```
xlsx4geo wild --file Tests.xlsx --country cz --iata prg

```

- Geoc

Convert a CSV file into custom CSV files.

```
xlsx4geo geoc --file cz-prg/cz-prg-coffee.csv > coffee.csv

```

- Geocfull

Convert all CSV files in a folder into custom CSV files.

```
xlsx4geo geocfull --surce cz-prg/ --result data/ --coords="16.3725042,48.2083537" > result.json
```
