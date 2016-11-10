var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

// GET /todos?completed=true
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if (typeof (queryParams.completed) !== 'undefined' && queryParams.completed.toLocaleLowerCase() === 'true'){
        filteredTodos = _.where(filteredTodos, {
            completed: true
        });
    } else if (typeof (queryParams.completed) !== 'undefined' && queryParams.completed.toLocaleLowerCase() === 'false'){
        filteredTodos = _.where(filteredTodos, {
            completed: false
        });
    }

    res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var item = _.findWhere(todos, {id: todoId});

    if (item) {
        res.json(item);
    } else {
        res.status(404).send();
    }
});

// POST /todos
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.description = body.description.trim();


    body.id = todoNextId;
    todoNextId += 1;
    todos.push(body);

    res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var item = _.findWhere(todos, {id: todoId});

    if (!item) {
        res.status(404).json({"error": "no todo found with that id"});
    } else {
        todos = _.without(todos, item);
        res.json(item);
    }
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};
    var todoId = parseInt(req.params.id, 10);
    var item = _.findWhere(todos, {id: todoId});

    if (!item) {
        return res.status(404).json({"error": "no todo found with that id"});
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')){
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')){
        // Never provided attribute, no problem here
        return res.status(400).send();
    }

    _.extend(item, validAttributes);

    res.json(item);
});

app.listen(PORT, function () {
    console.log('Express listening on port '+PORT+'!');
});