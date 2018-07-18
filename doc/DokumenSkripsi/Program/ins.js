var Viz = require('viz.js'); //visualisasi dalam bentuk grafik
var http = require('http');  //menjalankan server di web 
var axios = require('axios');//library untuk mengakses data raw di github perlu request data melalui http.

var engine, pilihan, resultGraph;

http.createServer(function (req, res) {
  var params = req.url.substring(req.url.lastIndexOf('?') + 1).split('&');
  for (var i = 0; i < params.length; i++) {
    var paramKeyValPair = params[i].split('=');
    if (paramKeyValPair[0] === 'engine') {
      engine = paramKeyValPair[1];
    } else if (paramKeyValPair[0] === 'pilihan') {
      pilihan = paramKeyValPair[1];
    } else {
      engine = 'dot';
      pilihan = 'false';
    }
  }
  console.log(engine, pilihan)
  axios.get("http://raw.githubusercontent.com/ftisunpar/data/master/prasyarat.json")
    .then(data => {
      var graphDot = [
        "digraph G {",
        rankSep(data.data),
        nodesMatkul(data.data),
        edgesMatkul(data.data),
        "}",
      ].join("\n");
      switch (engine) {
        case "circo":
          resultGraph = Viz(graphDot, { format: "svg", engine: "circo" });
          break;
        case "fdp":
          resultGraph = Viz(graphDot, { format: "svg", engine: "fdp" });
          break;
        case "neato":
          resultGraph = Viz(graphDot, { format: "svg", engine: "neato" });
          break;
        case "osage":
          resultGraph = Viz(graphDot, { format: "svg", engine: "osage" });
          break;
        case "twopi":
          resultGraph = Viz(graphDot, { format: "svg", engine: "twopi" });
          break;
        default:
          resultGraph = Viz(graphDot, { format: "svg" });
          break;
      }
      res.write(resultGraph);
      res.end();
    })
}).listen(8001);

function rankSep(data) {
  var rankMatkulWajibSemester = [];
  var rankMatkulPilihanSemester = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].wajib) {
      if (!rankMatkulWajibSemester.hasOwnProperty(data[i].semester)) {
        rankMatkulWajibSemester[data[i].semester] = [];
      }
      rankMatkulWajibSemester[data[i].semester].push("\"" + data[i].kode + "\"\;");
    } else if (!data[i].wajib) {
      if (pilihan === "true") {
        if (!rankMatkulPilihanSemester.hasOwnProperty(data[i].semester)) {
          rankMatkulPilihanSemester[data[i].semester] = [];
        }
        rankMatkulPilihanSemester[data[i].semester].push("\"" + data[i].kode + "\"\;");
      } else {

      }
    }
  }

  var result = [
    'ranksep = 1.30; size = "8.0,8.0";',
    "\n",
    "{",
    "node [shape = oval, fontsize = 16];",
    '"Semester 1" -> "Semester 2" -> "Semester 3" -> "Semester 4" -> "Semester 5" -> "Semester 6" -> "Semester 7" -> "Semester 8";',
    "}",
    "\n",
    "node [shape=box];"
  ];
  rankMatkulWajibSemester.forEach(function (item, index) {
    var str = '{rank = same; "Semester ' + index + '";' + item.join("") + '}';
    result.push(str);
  });

  if (pilihan === "true") {
    result.push("node [shape=box, color=green];");
    rankMatkulPilihanSemester.forEach(function (item, index) {
      var str = '{rank = same; "Semester ' + index + '";' + item.join("") + '}';
      result.push(str);
    });
  }
  result.push("\n");
  return result.join("\n");
}

function nodesMatkul(data) {
  var nodeMatkulSemester = [];
  //WAJIB
  for (var i = 0; i < data.length; i++) {
    if (data[i].wajib) {
      var str = "\"" + data[i].kode + "\"" + '[label=' + "\"" + data[i].kode + "-0" + data[i].sks + "\n" + data[i].nama + "\"" + ']';
      if (!nodeMatkulSemester.hasOwnProperty(data[i].semester)) {
        nodeMatkulSemester[data[i].semester] = [];
      }
      nodeMatkulSemester[data[i].semester].push(str);
    }
  }
  //PILIHAN
  if (pilihan === "true") {
    for (var i = 0; i < data.length; i++) {
      if (!data[i].wajib) {
        var str = "\"" + data[i].kode + "\"" + '[label=' + "\"" + data[i].kode + "-0" + data[i].sks + "\n" + data[i].nama + "\"" + ']';
        if (!nodeMatkulSemester.hasOwnProperty(data[i].semester)) {
          nodeMatkulSemester[data[i].semester] = [];
        }
        nodeMatkulSemester[data[i].semester].push(str);
      }
    }
  }
  
  var node = [];
  nodeMatkulSemester.forEach(function (item) {
    node.push(item.join(""));
  });

  return node.join("\n");
}

function edgesMatkul(data) {
  var edgeMatkul = [];

  for (var i = 0; i < data.length; i++) {
    if (data[i].wajib) {
      for (var j = 0; j < data[i].prasyarat.lulus.length; j++) {
        var str = "\"" + data[i].prasyarat.lulus[j] + "\" -> \"" + data[i].kode + "\"";
        edgeMatkul.push(str);
      }
    }
  }

  if (pilihan === "true") {
    for (var i = 0; i < data.length; i++) {
      if (!data[i].wajib) {
        for (var j = 0; j < data[i].prasyarat.lulus.length; j++) {
          var str = "\"" + data[i].prasyarat.lulus[j] + "\" -> \"" + data[i].kode + "\"";
          edgeMatkul.push(str);
        }
      }
    }
  }
  
  edgeMatkul.push("\n");
  edgeMatkul.push("edge [style=dotted];");

  for (var i = 0; i < data.length; i++) {
    if (data[i].wajib) {
      for (var j = 0; j < data[i].prasyarat.tempuh.length; j++) {
        var str = "\"" + data[i].prasyarat.tempuh[j] + "\" -> \"" + data[i].kode + "\"";
        edgeMatkul.push(str);
      }
    }
  }

  if(pilihan === "true") {
    for (var i = 0; i < data.length; i++) {
      if (!data[i].wajib) {
        for (var j = 0; j < data[i].prasyarat.tempuh.length; j++) {
          var str = "\"" + data[i].prasyarat.tempuh[j] + "\" -> \"" + data[i].kode + "\"";
          edgeMatkul.push(str);
        }
      }
    }
  }
  return edgeMatkul.join("");
}