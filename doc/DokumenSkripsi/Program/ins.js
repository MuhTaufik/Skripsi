var Viz = require("viz.js");
var http = require('http');
var https = require('https');
var kurikulum = require("./kurikulum.json");

http.createServer(function (req, res) {
    // http.get("http://raw.githubusercontent.com/ftisunpar/data/master/prasyarat.json", function(data) {
    //     console.log(data)
    // })
    // console.log(kurikulum)
    var graphDot = [
        "digraph G {",
        rankSep(kurikulum),
        nodesMatkul(kurikulum),
        edgesMatkul(kurikulum),
        "}",
      ].join("\n");
      var resultGraph = Viz(graphDot, { format: "svg"});
      res.write(resultGraph);
      res.end();
}).listen(8001);

function rankSep(data) {
  var rankMatkulWajibSemester = [];
  var rankMatkulPilihanSemester = [];
  for (var i = 0; i < data.length; i++) {
      if(data[i].wajib){
          if(!rankMatkulWajibSemester.hasOwnProperty(data[i].semester)){
            rankMatkulWajibSemester[data[i].semester] = [];
          }
          rankMatkulWajibSemester[data[i].semester].push("\"" + data[i].kode + "\"\;");
       } else if(!data[i].wajib) {
         if(!rankMatkulPilihanSemester.hasOwnProperty(data[i].semester)) {
             rankMatkulPilihanSemester[data[i].semester] = [];
         }
         rankMatkulPilihanSemester[data[i].semester].push("\"" + data[i].kode + "\"\;");
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
  rankMatkulWajibSemester.forEach(function(item, index){
    var str = '{rank = same; "Semester ' + index + '";' + item.join("") + '}';
    result.push(str);
  });

   result.push("node [shape=box, color=green];");
   rankMatkulPilihanSemester.forEach(function(item, index){
     var str = '{rank = same; "Semester ' + index + '";' + item.join("") + '}';
     result.push(str);
   });

   result.push("\n");
   return result.join("\n");
}

function nodesMatkul(data) {
  var nodeMatkulSemester = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].wajib){
            var str = "\"" + data[i].kode + "\"" + '[label=' + "\"" + data[i].kode + "-0" + data[i].sks + "\n" + data[i].nama + "\"" + ']';
            if(!nodeMatkulSemester.hasOwnProperty(data[i].semester)){
                nodeMatkulSemester[data[i].semester] = [];
            }
                nodeMatkulSemester[data[i].semester].push(str);
        } 
    }

     for (var i = 0; i < data.length; i++) {
         if (!data[i].wajib){
             var str = "\"" + data[i].kode + "\"" + '[label=' + "\"" + data[i].kode + "-0" + data[i].sks + "\n" + data[i].nama + "\"" + ']';
             if(!nodeMatkulSemester.hasOwnProperty(data[i].semester)){
                 nodeMatkulSemester[data[i].semester] = [];
             }
                 nodeMatkulSemester[data[i].semester].push(str);
         } 
     }
    var node = [];
    nodeMatkulSemester.forEach(function(item){
        node.push(item.join(""));
    });

    return node.join("\n");
}

function edgesMatkul (data) {
  var edgeMatkul = [];
  
    for (var i = 0; i < data.length; i++) {
        if(data[i].wajib){
            for (var j = 0; j < data[i].prasyarat.lulus.length; j++) {
              var str = "\"" + data[i].prasyarat.lulus[j] + "\" -> \"" + data[i].kode + "\"";
              edgeMatkul.push(str);
            }
        }
    }

     for (var i = 0; i < data.length; i++) {
         if(!data[i].wajib){
             for (var j = 0; j < data[i].prasyarat.lulus.length; j++) {
                 var str = "\"" + data[i].prasyarat.lulus[j] + "\" -> \"" + data[i].kode + "\"";
                 edgeMatkul.push(str);
             }
         }
     }

    edgeMatkul.push("\n");
    edgeMatkul.push("edge [style=dotted];");

    for (var i = 0; i < data.length; i++) {
        if(data[i].wajib){
            for (var j = 0; j < data[i].prasyarat.tempuh.length; j++) {
                var str = "\"" + data[i].prasyarat.tempuh[j] + "\" -> \"" + data[i].kode + "\"";
                edgeMatkul.push(str);
            }
        }
    }

     for (var i = 0; i < data.length; i++) {
         if(!data[i].wajib){
             for (var j = 0; j < data[i].prasyarat.tempuh.length; j++) {
                 var str = "\"" + data[i].prasyarat.tempuh[j] + "\" -> \"" + data[i].kode + "\"";
                 edgeMatkul.push(str);
             }
         }
     }
    return edgeMatkul.join("");
}