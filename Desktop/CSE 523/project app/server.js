// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Project = require('./models/project');
mongoose.connect('mongodb://localhost:27017/mydatabase');

// Create our Express application
var app = express();

// Use the body-parser package in our application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Create our Express router
var router = express.Router();

// Initial dummy route for testing
// http://localhost:3000/api
router.get('/', function(req, res) {
  res.json({ message: 'You are running Project APIs!' }); 
});


var projectsRoute = router.route('/projects');

// Create endpoint /api/projects for POSTS
projectsRoute.post(function(req, res) {
  // Create a new instance of the Project model
  var project = new Project();

  // Set the project properties
  if(req.body.name==null){
    res.status(400);
    var error = 
    {
       "status": 400,
       "status_description" : "Bad Request",
       "message": "Project name must be specified",
    }

    res.json({message : "Error in adding project", details: error});
  }
  if(req.body.entity==null){
    res.status(400);
    var error = 
    {
       "status": 400,
       "status_description" : "Bad Request",
       "message": "Associated project entity must be specified",
    }

    res.json({message : "Error in adding project", details: error});
  }
  project.name = req.body.name;
  project.entity = req.body.entity;
  project.owner = req.body.owner;
  project.description = req.body.description;
  project.employees = req.body.employees;
 
  project.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Project added to the database!', data: project });
  });
});

// Create endpoint /api/projects for GET
projectsRoute.get(function(req, res) {
  
  Project.find(function(err, projects) {
    if (err)
      res.send(err);

    res.json(projects);
  });
});

// Create a new route with the /projects/:project_id prefix
var projectRoute = router.route('/project/:project_id');

projectRoute.get(function(req, res) {
    Project.findById(req.params.project_id, function(err, project) {
    if (err)
      res.send(err);

    res.json(project);
  });
});

var projectEditRoute = router.route('/project/:project_id/edit');
// Create endpoint /api/projects/:project_id for PUT
projectEditRoute.put(function(req, res) {
  
  Project.findById(req.params.project_id, function(err, project) {
    if (err){
      
      //res.json({message : "Error in updating project", details: error});
    
    }
    // Update the existing project
    if(project==null)
    {
      
      res.status(404).send({ error: 'Error : Project does not exist in database!'});

     //res.json({message : "Error in updating project", details: error});
    }
    else{
    if(req.body.name!=null)
      project.name = req.body.name;
    if(req.body.entity!=null)  
      project.entity = req.body.entity;
    if(req.body.owner!=null)
      project.owner = req.body.owner;
    if(req.body.description!=null)
      project.description = req.body.description;
    if(req.body.employees!=null)
    project.employees = req.body.employees;
    
    project.save(function(err) {
      if (err)
        res.send(err);

      res.json(project);
    });
  }
});
});

var projectDelRoute = router.route('/project/:project_id/delete');

projectDelRoute.delete(function(req, res) {

  Project.count({_id: req.params.project_id}, function (err, count){ 
    if(count===0){
      res.status(404).send({ error: 'Project does not exist in database!'});
      //res.json({ message: 'Project does not exist in database!' });      
      }
    });

  Project.findByIdAndRemove(req.params.project_id, function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Project removed from the database!' });
  });
});


// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(port);
console.log('Server running on port ' + port);