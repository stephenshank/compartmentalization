const fs = require('fs');


const datasets = fs.readdirSync('data')
  .filter(filename => filename[0] != '.' && filename != 'datasets.json')
  .map(filename => filename.split('.')[0]);

fs.writeFileSync('data/datasets.json', JSON.stringify(datasets));
