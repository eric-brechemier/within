within
======
https://github.com/eric-brechemier/within

within is a factory of semi-private spaces  
where properties and events can be shared.

API
---

Function: `within( name, callback )`  
Create a semi-private space to share properties and events

Both name and callback can be omitted, resulting in three different forms
described in the sections below.

  * [`within( name, callback )`: any - run code in the space with given name]
    [WITHIN2]
  * [`within( name )`: object - access the space with given name]
    [WITHIN1]
  * [`within()`: object - access an anonymous space]
    [WITHIN0]

[WITHIN2]: #within-name-callback--any
[WITHIN1]: #within-name--object
[WITHIN0]: #within-object

### `within( name, callback )`: any ###

Run the given callback in the space with given name and return the result
of the callback (left as undefined if missing).

This form allows to create modules that span multiple source files
before concatenation.

    // module1-part1.js
    within( "example.org/module1", function( get, set, publish, subscribe ) {
      // definition of module 1, part 1
    });

    // module1-part2.js
    within( "example.org/module1", function( get, set, publish, subscribe ) {
      // definition of module 1, part 2
    });

    // module1-part3.js
    within( "example.org/module1", function( get, set, publish, subscribe ) {
      // definition of module 1, part 3
    });

A module is identified by a domain name and a path forming the module name
which roughly corresponds to a space where you would be able to publish
contents on the Web (although you don't have to):

    "example.tld/hypothetic/path/to/module"

The intent is to avoid clashes with modules defined by different people and
organizations, or even yourself in the future.

The callback function runs immediately, within the context of an object
that holds data for the module; the same object is provided in all parts
of the module:

    within( "example.org/module1", function( get, set, publish, subscribe ) {
      // 'this' refers to semi-private module data
    });

Four functions are provided as arguments to the callback to interact with
data and publish events within the confines of this shared symbolic space:

* `get( name )` - get the value of a property in module data
* `set( name, value )` - set the value of a property in module data
* `publish( name, value )` - set the value of a property and publish an event
* `subscribe( name, listener )` - subscribe to an event published in the module

The `get()` and `set()` functions simply get and set properties in the module
data, without publishing any event. Since the data object can also be
accessed as `this` in the callback function, properties can also be set
and retrieved directly.

The advantage of `get()` over direct access through `this` is that it only
retrieves the value of *own* properties stored directly in the data object,
and not the value of properties *inherited* from the Object prototype chain,
which allows to use the data object as a hash, without tripping on
[special names such as 'constructor' or 'hasOwnProperty'][OBJECT_PROTOTYPE].

[OBJECT_PROTOTYPE]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype

There is no particular advantage for `set()` compared with directly setting
a value through `this`, except that the `set()` function remains accessible
in all functions defined within the callback function provided as argument
to `within()`, unlike `this` which varies as the calling context of each
function changes:

    within( "example.org/module1", function( get, set, publish, subscribe ){

      // 'this' refers to module data
      // get() and set() allow to get/set properties in module data

      function innerFunction() {
        // 'this' no longer refers to module data
        // get() and set() still allow to get/set properties in module data
      }

      innerFunction();
    });

The `publish()` function notifies registered listeners of the occurrence of
an event in the module together with the current value of the associated
property. A common use case is to call `publish()` twice in a row,
with a verb in the active form and the same verb in passive form:

    publish( "start", {
      // configuration properties
    });
    publish( "started", true );

Listeners for `"start"` may process provided data in turn while listeners
for `"started"` will get notified once the processing completes:

    subscribe( "start", function( config ) {
      // configure some behavior using provided properties
    });

    subscribe( "started", function() {
      // start using the configured behavior
    });

The value of the event is also set to the property of the same name:

    subscribe( "start", function( config ) {
      // get( "start" ) === config; // true
    });

When no value is provided in the call to `publish()`, it defaults to the
boolean value `true`:

    publish( "started" );

    subscribe( "started", function() {
      // get( "started" ) === true; // true
      // start using the configured behavior
    });

When a listener is registered for an event while the property of the same
name has already been set, `subscribe()` fires the listener immediately
without waiting for the next call to `publish()`:

    publish( "started" );

    subscribe( "started", function( value ) {
      // called immediately with the current value of the property:
      // get( "started" ) === true;
    });

As a side effect, this is also the case when the property has only been
set and never published before:

    // no call to publish( "started" ) before
    set( "started", true );

    subscribe( "started", function( value ) {
      // called immediately with the current value of the property:
      // get( "started" ) === true;
    });

For convenience, `this` also refers to the module data object in listeners
for events of the module:

    subscribe( "start", function() {
      // 'this' refers to the module data
      this.score = 0;
    });

### `within( name )`: object ###

Access the space with given name. Returns an object with four methods to
interact with the space, `get`, `set`, `publish`, and `subscribe`:

    {
      get: function( name ){ /* ... */ },
      set: function( name, value ){ /* ... */ },
      publish: function( name, value ){ /* ... */ },
      subscribe: function( name, listener ){ /* ... */ }
    }

This shorter pattern is intended for use in debugging:

    console.log( within( "example.org/game" ).get( "score" ) );
    within( "example.org/game" ).set( "score", 0 );
    within( "example.org/game" ).subscribe( "bonus", function( bonus ){
      console.log( bonus );
    });
    within( "example.org/game" ).publish( "bonus", 100 );

The above form is more redundant but easier to type in the console,
due to reduced indentation level compared with the equivalent form below:

    within( "example.org/game", function( get, set, publish, subscribe ){
      console.log( get( "score" ) );
      set( "score", 0 );
      subscribe( "bonus", function( bonus ){
        console.log( bonus );
      });
      publish( "bonus", 100 );
    });

The shorter form is also useful when interacting with a module from within
another module:

    within( "example.org/test", function( get, set, publish, subscribe ){

      var game = within( "example.org/game" );

      game.subscribe( "bonus", function( bonus ){
        var score = game.get( "score" );
        game.set( "score", score + bonus );
      });

      game.publish( "bonus", 100 );

    });

The short form above is more readable due to reduced nesting, and less
confusing than the longer form below which uses the same function names
`get`, `set`, `publish`, `subscribe` for the methods of two different modules:

    within( "example.org/test", function( get, set, publish, subscribe ){
      // get, set, publish, subscribe are methods of module "example.org/test"

      within( "example.org/game", function( get, set, publish, subscribe ){
        // get, set, publish, subscribe are methods of "example.org/game"

        subscribe( "bonus", function( bonus ){
          var score = get( "score" );
          set( "score", score + bonus );
        });

        publish( "bonus", 100 );
      });

    });

### `within()`: object ###

Access an anonymous space. Returns an object with the four methods to interact
with the space, `get`, `set`, `publish`, and `subscribe`.

Each call results in the creation of a different anonymous space,
for single use. No reference to this space is kept in the factory.

This form allows to create separate spaces for multiple instances of an
application, or more generally multiple instances of objects in a collection:

    function Item() {
      var space = within(); // create a new space for single use

      function publish( name, value ){
        // publish an event only for this item
        space.publish( name, value );
      }

      // each item can process its own events
      // without additional filtering required
    }

An alternative would be to assign a different id to each item in the
collection, and use it to customize either the event name or the data:

    // customize the event name using the id
    publish( "example.org/collection/" + id, data );

    // the subscription must build the event name in the same way
    subscribe( "example.org/collection/" + id, function( data ) {
      // process the event
    });

    // customize the data using the id
    data.id = id;
    publish( "example.org/collection", data );

    subscribe( "example.org/collection", function( data ) {
      // an extra filter is required in the event subscriber
      if ( data.id !== id ) {
        return;
      }

      // process the event
    });

Since there is no method provided to reset the factory at this point,
references to named modules are preserved for the lifetime of the application.
If you want to manage this cache separately, you can use anonymous modules
instead, which maintains the factory in a blank state.

LANGUAGE
---------

JavaScript  

AUTHOR
------

Eric Bréchemier  
http://eric.brechemier.name

LICENSE
-------

CC0 - No Copyright  
https://creativecommons.org/publicdomain/zero/1.0/

