var express     = require('express');
var  morgan     = require( 'morgan');
var  cors       = require( 'cors');
var  path       = require( 'path');
var  bodyParser = require( 'body-parser');
var  history    = require( 'connect-history-api-fallback');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const app     = express();
const uri = "mongodb://localhost:27017";
const options = {useNewUrlParser: true, useUnifiedTopology: true};

var db;
MongoClient.connect(uri, options, function(err, client) {
    if (err) {
        console.log('an error occurred while connecting to mongodb')
    } else {
        console.log('connected to db');
        db = client.db('ud');
    }
});
//----------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
//app.use(history());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/', require('./routes/activity'))


//-----------------------------------------------------------
//                   REST ROUTES ACTIVITIES
//-----------------------------------------------------------

app.get("/api/activities", function(req, res){
    console.log('backend')
    db.collection('activities').find({}).toArray(function(err, activities){
        console.log('finding all activities')
        if(err){
            console.log('an error');
            res.json(err);
        } else {
            res.json(activities);
        }
    });
});

app.get("/api/activities/provider/:provider", function(req, res){
    console.log('backend')
    console.log(req.params.provider)
    db.collection('activities').find({
        email: req.params.provider
    }).toArray(function(err, activities){
        console.log('finding all activities for a provider')
        if(err){
            console.log(err);
            res.send(err);
        } else {
            res.json(activities);
        }
    });
});

app.get("/api/activities/:id", function(req, res){
    db.collection('activities').findOne({
        _id: ObjectId(req.params.id)
    }, function(err, activity){
        if(err){
            console.log(err);
            res.send("Activity not found.");
        } else {
            console.log(activity);
            res.json(activity);
        }
    })
});

app.post("/api/activities/add", function(req, res){
    console.log("creating");
    console.log(req.body);
    db.collection('activities').insertOne(
        {
            email: req.body.email,
            activity: req.body.activity,
            area:req.body.area,
            length:req.body.length,
            location:req.body.location,
            price:req.body.price,
            time: req.body.time,
            sumReviews:0,
            numReviews:0,
            avgReviews:0,
            type:req.body.type,
            reviews:[]
        }, function(err, cat){
            if(err) {
                console.log(err);
                res.status(500).json({
                    message: 'An error occurred while creating activity'
                });
            } else {
                res.status(200).json({
                    message: 'Activity successfully created'
                });
            }
        }
    );
});

app.put("/api/activities/:id/rate", function (req, res) {
    db.collection('activities').findOneAndUpdate({
        _id: ObjectId(req.params.id)
    }, {
        $push: {
            reviews: req.body
        }
        
    }, function(err) {
        if (err) {
            return res.status(500).json({
                message: "An error occurred"
            });
        }
        res.status(200).json({
            message: "Rating submitted"
        });
    })
})

app.delete("/api/activities/:id", function(req, res){
    db.collection('activities').deleteOne({
        _id: ObjectId(req.params.id)
    }, function(err){
        if(err) {
            res.status(500).json({
                message: 'An error occurred while deleting activity'
            });
        } else {
            console.log("removed");
            res.status(200).json({
                message: 'Activity removed'
            });
        }
    })
});

app.put("/api/activities/:id", function(req, res){
    db.collection('activities').findOneAndUpdate({
        _id: ObjectId(req.params.id)
    }, {
        $set: req.body
    }, function (err, post) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                message: 'An error occurred while updating activity'
            });
        }
        res.status(200).json(post);
    });
});
//Edit form
app.get("/activities/:id/edit", function(req, res){
    db.collection('activities').findOne({
        _id: ObjectId(req.params.id)
    }, function(err, activity){
        if(err){
            res.send("Activity " + req.params.id +" does not exist.");
        } else {
            res.render("activities/edit", {act: activity}); 
        }
    })
});

//-----------------------------------------------------------
//                      REST Users
//-----------------------------------------------------------
app.post("/api/users/login", function(req, res){
    console.log(req.body);
    db.collection('users').findOne({ email: req.body.email, password:req.body.password},{password:0}, function(err, user){
        if(err){
            res.send({error:"404",err});
        } else {
            res.json(user);
        }
    })
});

app.put("/api/users/:id", function(req, res){
    var updatedUser = db.collection('users').findOneAndUpdate({
        _id: ObjectId(req.params.id)
    }, {
        $set: req.body
    }, function (err, post) {
        if (err) return next(err);
        res.json(post);
       });
});//updating the user

app.post("/api/users/", function(req, res){//for creating a user rest api post
    db.collection('users').insertOne(
        {
            email: req.body.email,
            password: req.body.password,
            role:req.body.role,
            aboutMe:""
        }, function(err, user){
            if(err){
                console.log(err);
            } else {
                console.log(user);
                res.json(user);
            }
        }
    );
});

app.get("/api/users/:email", function(req, res) {
    db.collection('users').findOne({
        email: req.params.email
    }, function (err, user) {
        if (err) return res.status(500).json({
            message: "An error occurred"
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        res.json(user);
       });
})

app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.set('PORT', process.env.PORT || 3000);

app.listen(app.get('PORT'), function(){
    console.log("serving on port " + app.get('PORT'));
});
