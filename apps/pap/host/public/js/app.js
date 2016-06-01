(function() {

    // Create Backbone Model and Collection
    // ------------------------------------

    // model
    var Item = Backbone.Model.extend({
        modelName: 'item', // so denormalizers can resolve events to model

        initialize: function() {
            // bind this model to get event updates - a lot of magic ;)
            // not more to do the model gets updated now
            this.bindCQRS();
        }
    });

    // collections
    var Items = Backbone.PageableCollection.extend({
        model: Item,
        url: '/allItems.json',
        state: {
            pageSize: 5
        },
        mode: "client", // page entirely on the client side
    });

    var items = new Items();


    // Init Backbone.CQRS
    // ------------------

    // we just have to override eventNameAttr:
    Backbone.CQRS.hub.init({ eventNameAttr: 'event' });

    // override Backbone.sync with CQRS.sync which allows only GET method
    Backbone.sync = Backbone.CQRS.sync;


    // Wire up communication to/from server
    // ------------------------------------

    // create a socket.io connection

    console.log(window.location.host);
    var socket = io.connect('http://cqrs-host-99.cfapps.io:4443', { transports: ['websockets'] });
    //var socket = io.connect('http://localhost:3000');


    // on receiving an event from the server via socket.io 
    // forward it to backbone.CQRS.hub
    socket.on('events', function(evt) {
        Backbone.CQRS.hub.emit('events', evt);
    });

    // forward commands to server via socket.io
    Backbone.CQRS.hub.on('commands', function(cmd) {
        socket.emit('commands', cmd);
    });



    // Create a few EventDenormalizers
    // -------------------------------

    // itemCreated event 
    var itemCreateHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: Item,
        collection: items,

        // bindings
        forModel: 'item',
        forEvent: 'itemCreated'
    });

    // itemChanged event
    var itemChangedHandler = new Backbone.CQRS.EventDenormalizer({
        forModel: 'item',
        forEvent: 'itemChanged'
    });

    // itemDeleted event 
    var itemDeletedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',

        // bindings
        forModel: 'item',
        forEvent: 'itemDeleted'
    });



    // Create Backbone Stuff
    // ---------------------

    // table view

    var DeleteCell = Backgrid.Cell.extend({
        template: _.template('<a class="deleteItem">delete</a>'),



        initialize: function(options) {
            DeleteCell.__super__.initialize.apply(this, arguments);
            //this.model.bind('destroy', this.remove, this);
            this.listenTo(this.model, "backgrid:edited", this.remove);
        },

        events: {
            'click .deleteItem': 'uiDeleteItem'
        },

        // send deletePerson command with id
        uiDeleteItem: function(e) {
            e.preventDefault();

            // CQRS command
            var cmd = new Backbone.CQRS.Command({
                id: _.uniqueId('msg'),
                command: 'deleteItem',
                payload: {
                    id: this.model.id
                }
            });
            // emit it
            cmd.emit();
        },

        render: function() {
            this.$el.html(this.template());
            this.delegateEvents();
            return this;
        },

    });

    var columns = [{
        name: "id", // The key of the model attribute
        label: "ID", // The name to display in the header
        editable: false, // By default every cell in a column is editable, but *ID* shouldn't be
        // Defines a cell type, and ID is displayed as an integer without the ',' separating 1000s.
        cell: "string"
    }, {
        name: "ref",
        label: "Reference",
        // The cell type can be a reference of a Backgrid.Cell subclass, any Backgrid.Cell subclass instances like *id* above, or a string
        cell: "string" // This is converted to "StringCell" and a corresponding class in the Backgrid package namespace is looked up
    }, {
        name: "text",
        label: "Country",
        cell: "string" // An integer cell is a number cell that displays humanized integers
    }, {
        name: "test",
        label: "Delete",
        editable: false,
        // The cell type can be a reference of a Backgrid.Cell subclass, any Backgrid.Cell subclass instances like *id* above, or a string
        cell: DeleteCell // This is converted to "StringCell" and a corresponding class in the Backgrid package namespace is looked up

    }];



    // Initialize a new Grid instance
    var grid = new Backgrid.Grid({
        columns: columns,
        collection: items
    });

    // Render the grid and attach the root to your HTML document
    $("#example-1-result").append(grid.render().el);

    // Initialize the paginator
    var paginator = new Backgrid.Extension.Paginator({
        collection: items
    });

    // Render the paginator
    $("#example-1-result").after(paginator.render().el);

    // Fetch some countries from the url
    //items.fetch({ reset: true });


    // view templates
    var itemTemplate = _.template('<td><%= id %></td> <td><%= ref %></td> <td><%= text %></td> <td><a class="deleteItem" href="">delete</a></td> <td><a class="editItem" href="">edit</a></td>');
    var editItemTemplate = _.template('<input id="newRef" type="text" value="<%= ref %>"><input id="newText" type="text" value="<%= text %>"></input><button id="changeItem">save</button>');

    // views
    var ItemView = Backbone.View.extend({

        tagName: 'tr',
        className: 'item',

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        events: {
            'click .editItem': 'uiEditItem',
            'click .deleteItem': 'uiDeleteItem',
            'click #changeItem': 'uiChangeItem'
        },

        // render edit input
        uiEditItem: function(e) {
            e.preventDefault();
            this.model.editMode = true;
            this.render();
        },

        // send deletePerson command with id
        uiDeleteItem: function(e) {
            e.preventDefault();

            // CQRS command
            var cmd = new Backbone.CQRS.Command({
                id: _.uniqueId('msg'),
                command: 'deleteItem',
                payload: {
                    id: this.model.id
                }
            });
            // emit it
            cmd.emit();
        },

        // send changeItem command with new name
        uiChangeItem: function(e) {
            e.preventDefault();

            var itemText = this.$('#newText').val();
            var itemRef = this.$('#newRef').val();
            console.log('2');

            this.$('#newText').val('');
            this.model.editMode = false;
            this.render();

            if (itemText && itemRef) {
                console.log('3');

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id: _.uniqueId('msg'),
                    command: 'changeItem',
                    payload: {
                        id: this.model.id,
                        text: itemText,
                        ref: itemRef
                    }
                });

                // emit it
                cmd.emit();
            }
        },

        render: function() {
            if (this.model.editMode) {
                $(this.el).html(editItemTemplate(this.model.toJSON()));
            } else {
                $(this.el).html(itemTemplate(this.model.toJSON()));
            }
            //console.log(this.model.toJSON());
            return this;
        },

        remove: function() {
            $(this.el).fadeOut('slow');
        }

    });

    var IndexView = Backbone.View.extend({

        el: '#index-view',

        initialize: function() {
            console.log('Initializing Index View');
            /*_.bindAll(this, 'addItem');

            this.collection = app.items;
            this.collection.bind('reset', this.render, this);
            this.collection.bind('add', this.addItem, this);*/
        },

        events: {
            'click #addItem': 'uiAddItem'
        },

        // send createPerson command
        uiAddItem: function(e) {
                e.preventDefault();

                var resultados = $('form').serializeArray();
                console.log(resultados[1]);

                var itemText = resultados[1].value;
                var itemRef = resultados[0].value;

                var values = {};

                for (i = 0; i < resultados.length; i++) {
                    var eing = {};
                    values[resultados[i].name] = resultados[i].value;
                }
                console.log(values);
                resultados = {};

                //var itemText = this.$('#newItemText').val();
                //var itemRef = this.$('#newItemRef').val();

                if (values) {

                    // CQRS command
                    var cmd = new Backbone.CQRS.Command({
                        id: _.uniqueId('msg'),
                        command: 'createItem',
                        payload: values
                    });
                    console.log('lo va a emitir');

                    // emit it
                    cmd.emit();
                }

                this.$('#newItemText').val('');
                this.$('#newItemRef').val('');

                //if (window.location.pathname === '/internships/new') window.location = '/';

            }
            /*,

                    render: function() {
                        this.collection.each(this.addItem);
                    },

                    addItem: function(item) {
                        var view = new ItemView({ model: item });
                        this.$('#items').append(view.render().el);
                    }*/

    });

    var LoginView = Backbone.View.extend({

        el: '#login-view',

        initialize: function() {
            console.log('Initializing Login View');
            //_.bindAll(this, 'loginUser');

            //this.collection = app.items;
            //this.collection.bind('reset', this.render, this);
            //this.collection.bind('add', this.addItem, this);
        },

        events: {
            'click #submitUser': 'uiSubmitUser'
        },

        // send createPerson command
        uiSubmitUser: function(e) {
            //aquí tengo que hacer una llamada a la API y, si es exitosa, guardar el usuario en localStorage y redirigir a index
            e.preventDefault();
            console.log('dentro');

            var resultados = $('form').serializeArray();
            console.log(resultados[1]);

            var username = resultados[1].value;
            var password = resultados[0].value;

            var values = {};

            for (i = 0; i < resultados.length; i++) {
                var eing = {};
                values[resultados[i].name] = resultados[i].value;
            }
            console.log(values);
            resultados = {};

            //var itemText = this.$('#newItemText').val();
            //var itemRef = this.$('#newItemRef').val();

            /*if (values) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id: _.uniqueId('msg'),
                    command: 'createItem',
                    payload: values
                });

                // emit it
                cmd.emit();
            }*/

            $.ajax({
                url: 'http://localhost:8080/api/login',
                type: 'POST',
                dataType: 'json',
                data: values,
                complete: function(xhr, status, error) {
                    //console.log(["Login request details: ", data]);
                    console.log(status);

                    if (status === 'error' || !xhr.responseText) {
                        console.log(error);
                    } else {
                        console.log('It Works!');
                        Cookies.set('state', 'logged');
                        window.location.replace('/auth/cookie');
                    }

                },
                error: function(data, def) {
                    console.log(def);
                    $('#errorMessage').text('Wrong');
                }
            });

            //this.$('#newItemText').val('');
            //this.$('#newItemRef').val('');

            //if (window.location.pathname === '/login') window.location = '/';

        },

        render: function() {
            //dethis.collection.each(this.loginUser);
        },

        submitUser: function(user) {
            var view = new ItemView({ model: user });
            this.$('#items').append(view.render().el);
        }

    });


    // Bootstrap Backbone
    // ------------------

    var app = {};
    var init = function() {
        app.items = items;
        app.items.fetch();
        console.log(app.items);

        if (window.location.pathname === '/internships/new') {
            var indexView = new IndexView();
            indexView.render();
        } else {
            var loginView = new LoginView();
            loginView.render();
        }/* else {
            var itemView = new ItemView();
            itemView.render();
        }*/

    };

    // kick things off
    $(init);

})();
