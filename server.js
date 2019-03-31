var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
require('request-debug')(request);
var fetch =  require('fetch');
var mysql = require('mysql');
var config = require("./config.json");

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  // CORS removal
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Static HTML server
  app.use(express.static(__dirname + '/public'));

  // DB Connection
  var pool = mysql.createPool(config);

  //  An endpoint to test from mobile application
  app.get('/test', (req, res) =>{
    var done = {
      "sucess": 1
    }
    res.send(done);
  });

  //   An endpoint to get items of a bill based on a bill id:
  app.get('/bill/:billId', (req,res)=>{
    pool.query('SELECT * FROM Bill where billId = ?',[req.params.billId], (error,results,fields)=>{
      if (error) throw error;
       console.log('The solution is: ', results);
      res.send(results);
    })
  });

  // To check if the user is registered
  app.get('/isRegistered', (req,res)=>{
    pool.query('SELECT * from details;', function (error, results, fields) {
      if (error) throw error;
      console.log('The solution is: ', results);
      var output;
      if(results.length<1){
        output = {
          "isRegistered": 0
        }
      }
      else{
        output = {
          "isRegistered": 1
        }
      }
      res.send(output);
    });
  });

  // To register the details of user
  app.post('/Register', (req,res)=>{
    pool.query('delete from details',(error,results,fields)=>{
      if (error) throw error;
       console.log("row deleted");
    });
    pool.query('Insert into details values(?, ?)',[req.body.name, req.body.GST], (error,results,fields)=>{
      if (error) throw error;
      var output={
        success: 1
      }
      res.send(output);
    })
  });


  // An endpoint to add a product in current order
  app.post('/productscan', (req,res)=>{
    pool.query('Insert into `CurrentOrder` values(?, ?, 1, ?, ? )',[req.body.pId, req.body.pName, req.body.price, req.body.gst], (error,results,fields)=>{
      if (error) throw error;
       console.log('The solution is: ', rows);
      res.send("added succesfully");
    })
  });

  
  //Vaibhav: query for getting product with required productid
 app.get('/product/', (req,res)=>{

   console.log("req body: ", req.body);
   pool.query("SELECT * FROM products WHERE pid=?",[req.body.id], (err,rows,fields)=>{
     if(!err){
        console.log(rows);
        res.send(rows);
     }
     else {
       console.log(err);
     }
   })
 });

  // Vaibhav: query for deleting a product from DATABASE
   app.get('/deletepro/', (req,res)=>{
     var pro = req.body.name;
     pool.query("DELETE FROM products WHERE pname=?",[pro],(err,rows,fields)=>{
       if(!err){
         console.log("product deleted");
         res.send("deleted succesfully");
       }else{
         console.log(err);
       }
     })
   });

 //Vaibhav: query  for entering bill PDetails
 app.post('/addbill/', (req,res)=>{
     console.log("request", req.body);

     var billno = req.body.billno;
     var bdate = req.body.bdate;
     var billamt = req.body.billamt;
     var gst = req.body.gst;

     pool.query('INSERT INTO `bills` VALUES (?,?,?,?)',[parseInt(billno), bdate, parseInt(billamt), parseFloat(gst)], (err,rows,fields)=>{
       if(!err){
          res.send("added succesfully");
       }
       else {
         console.log(err);
       }
     })
   });


  //Vaibhav: -getting the latest bill id
   app.get('/getlatest/', (req,res)=>{
     pool.query('SELECT * FROM bills ORDER BY billno LIMIT 1', (err,rows,fields)=>{
       if(!err){
          res.send(rows);
       }
       else {
         console.log(err);
       }
     })
   });

  // Starting the server on 8083 port
  app.listen(8083, function () {
    console.log('App listening on port 8083!');
  });


/*
// Vaibhav:

var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:process.env.passoword,
    database:"gst"
  });

mysqlConnection.connect((err)=> {
  if(!err)
   console.log("DB connection succeded");
  else {
    console.log("DB connection failed \n error"+JSON.stringify(err, undefined, 2));
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, ()=>console.log('express server is ready at port no: 3000'));

app.get('/', (req,res)=>{
       res.send("hi this is port 3000");
});

 query adding a product in DATABASE
app.post('/addproduct/', (req,res)=>{
  console.log("request", req.body);
  var pid = req.body.pid;
  var pname = req.body.pname;
  var price = req.body.price;
  var gstrate = req.body.gstrate;

  mysqlConnection.query('INSERT INTO `products` VALUES (?,?,?,?)',[pid.toString(), pname.toString(), parseInt(price), parseFloat(gstrate)], (err,rows,fields)=>{
    if(!err){
       res.send("added succesfully");
    }
    else {
      console.log(err);
    }
  })
});

 query for getting product with required productid
app.get('/product/', (req,res)=>{

  console.log("req body: ", req.body);
  mysqlConnection.query("SELECT * FROM products WHERE pid=?",[req.body.id], (err,rows,fields)=>{
    if(!err){
       console.log(rows);
       res.send(rows);
    }
    else {
      console.log(err);
    }
  })
});

 query for deleting a product from DATABASE
app.get('/deletepro/', (req,res)=>{
  var pro = req.body.name;
  mysqlConnection.query("DELETE FROM products WHERE pname=?",[pro],(err,rows,fields)=>{
    if(!err){
      console.log("product deleted");
      res.send("deleted succesfully");
    }else{
      console.log(err);
    }
  })
})

 query  for entering bill PDetails
app.post('/addbill/', (req,res)=>{
  console.log("request", req.body);

  var billno = req.body.billno;
  var bdate = req.body.bdate;
  var billamt = req.body.billamt;
  var gst = req.body.gst;

  mysqlConnection.query('INSERT INTO `bills` VALUES (?,?,?,?)',[parseInt(billno), bdate, parseInt(billamt), parseFloat(gst)], (err,rows,fields)=>{
    if(!err){
       res.send("added succesfully");
    }
    else {
      console.log(err);
    }
  })
});


 //getting the latest bill id
app.get('/getlatest/', (req,res)=>{
  mysqlConnection.query('SELECT * FROM bills ORDER BY billno LIMIT 1', (err,rows,fields)=>{
    if(!err){
       res.send(rows);
    }
    else {
      console.log(err);
    }
  })
})
*/
