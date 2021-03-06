// within.js (License: CC0)
// https://github.com/eric-brechemier/within
//
// within is a factory of semi-private spaces
// where properties and events can be shared
// in isolation.
//
// Usage:
//
//   // Run code within a module
//   within( "your.domain/path", function( publish, subscribe, get, set ) {
//     // semi-private space
//   });
//
//   // Access a shared space by name
//   within( "your.domain/path" ).set( "property", "value" );
//
//   // Create an anonymous space for single use
//   var space = within();

// from sub/nada/privately.js (CC0)
function privately( func ) {
  return func();
}

privately(function() {
  var
    WITHIN_ITSELF = 'within.js.org', // namespace for the library itself
    WITHIN_VERSION = 'v1.5.0', // version of the library

    undef, // do not trust global undefined, which can be set to a value
    dataSpaces = {},
    eventSpaces = {},
    has,
    call,
    publishWithinWithin;

  // from sub/nada/no.js (CC0)
  function no( value ) {
    return value === null || value === undef;
  }

  // from sub/nadasurf/or.js (CC0)
  function or( a, b ) {
    return no( a )? b: a;
  }

  // from sub/nada/copy.js (CC0)
  function copy( array ) {
    return [].concat( array );
  }

  // from sub/nada/remove.js (CC0)
  function remove( array, value ) {
    var i;
    for ( i = array.length; i >= 0; i-- ) {
      if ( array[ i ] === value ){
        array.splice( i, 1 );
      }
    }
  }

  // from sub/nada/forEach.js (CC0)
  function forEach( array, callback ) {
    var
      isBreak = false,
      i,
      length = array.length;

    for ( i = 0; i < length && !isBreak ; i++ ){
      isBreak = callback( array[ i ], i ) === true;
    }

    return isBreak;
  }

  // from sub/nada/bind.js (CC0)
  function bind( func, object ) {
    return function() {
      return func.apply( object, arguments );
    };
  }

  // from sub/nadasurf/alias.js (CC0)
  function alias( func ) {
    return bind( func.call, func );
  }

  has = alias( Object.prototype.hasOwnProperty );
  call = alias( Function.prototype.call );

  /*
    Function: within( [name, [callback]] ): any
    Create a semi-private space to share properties and events

    Parameters:
      spaceName - string, optional, name of the symbolic space:
                  a domain name and path that you control on the Web.
                  Example: "within.js.org/tests/module1"
      callback - function( publish, subscribe, get, set ), optional, function
                 called immediately in the context ('this') of the space data
                 object with four functions (described separately below) as
                 arguments to share events and properties within the space.

    Returns:
      any, the value returned by the callback function,
      or a space function with the four methods publish, subscribe, get, set,
      to interact with the space data when the callback function is omitted;
      the space function can then be called at any point with the same kind
      of callback function described above to run code within the space.
      When no name is provided, an anonymous module is created for single use,
      for which no reference is kept in the internal space factory.
  */
  function within( spaceName, callback ) {
    var
      // data space - object(string -> any), set of properties
      dataSpace,
      // event space - object(string -> array of functions), event listeners
      eventSpace;

    if ( no( spaceName ) ) {
      dataSpace = {};
      eventSpace = {};
    } else {
      if ( !has( dataSpaces, spaceName ) ) {
        dataSpaces[ spaceName ] = {};
        eventSpaces[ spaceName ] = {};
      }
      dataSpace = dataSpaces[ spaceName ];
      eventSpace = eventSpaces[ spaceName ];
    }

    /*
      Function: set( name, value )
      Set the value of a property of the module

      Parameters:
        name - string, the name of a property in module data object
        value - any, the new value of the property
    */
    function set( name, value ) {
      dataSpace[ name ] = value;
    }

    /*
      Function: publish( name[, value] )
      Set the value of a property and fire listeners registered for this event
      in this module and in this module only, until a listener returns true or
      all listeners have been called.

      Parameters:
        name - string, the name of an event and the associated property
        value - any, optional, the new value of the property, also provided
                to listeners, defaults to boolean value true
    */
    function publish( name, value ) {
      var listeners;
      if ( arguments.length < 2 ) {
        value = true;
      }
      set( name, value );
      if ( !has( eventSpace, name ) ) {
        return;
      }
      listeners = copy( eventSpace[ name ] );
      forEach( listeners, function( listener ) {
        return call( listener, dataSpace, value );
      });
    }

    /*
      Function: subscribe( name, listener[, now] ): function
      Register a callback function for the event of given name

      Parameters:
        name - string, the name of an event and the related property
        listener - function( value ), the callback triggered in the context of
                   the module data object:
                   - immediately, if the property with given name has been set,
                     with the value of the property as parameter, unless the
                     parameter `now` is set to `false`.
                   - then each time the event with given name is published
                     until the subscription is cancelled, with the value of
                     the property when the event is published as parameter.
        now - boolean, whether to start the subscription with current value,
              if any, defaults to true.

      Returns:
        function(), the function to call to remove current callback function
        from listeners and prevent it from receiving further notifications
        for this event.
    */
    function subscribe( name, listener, now ) {
      var listeners;
      now = or( now, true );
      if ( !has( eventSpace, name ) ) {
        eventSpace[ name ] = [];
      }
      listeners = eventSpace[ name ];
      listeners.push( listener );
      if ( has( dataSpace, name ) ) {
        if ( now ) {
          call( listener, dataSpace, dataSpace[ name ] );
        }
      } else {
        publishWithinWithin( 'missing', {
          space: spaceName,
          property: name
        });
      }
      return function unsubscribe() {
        remove( listeners, listener );
      };
    }

    /*
      Function: get( name[, callback] ): any
      Retrieve the value of a property

      Parameters:
        name - string, the name of a property in module data object
        callback - optional, function( value ), callback called, just once,
                   with the value of the property, immediately when available,
                   or as soon as it gets published, otherwise
                   (this is equivalent to a one-time subscription)

      Returns:
        any, the current value of the property with given name
        (read only from own properties of the module data object)
        of `undefined` if no value has been set
    */
    function get( name, callback ) {
      if ( !has( dataSpace, name ) ){
        if ( arguments.length > 1 ) {
          var cancelOneTimeSubscription = subscribe( name, function( value ) {
            cancelOneTimeSubscription();
            call( callback, this, value );
          });
        }
        return undef;
      }
      if ( arguments.length > 1 ) {
        call( callback, dataSpace, dataSpace[ name ] );
      }
      return dataSpace[ name ];
    }

    /*
      Function: space( callback ): any
      Run code in the given space

      Parameter:
        callback - function( publish, subscribe, get, set ), optional, function
                   called immediately in the context ('this') of the space data
                   object with four functions (described above) as arguments to
                   share events and properties within the space.

      Returns:
        any, the value returned by the callback function,
        or undefined
    */
    function space( callback ) {
      return callback.apply( dataSpace, [ publish, subscribe, get, set ] );
    }

    if ( arguments.length < 2 ) {
      space.publish = publish;
      space.subscribe = subscribe;
      space.get = get;
      space.set = set;
      return space;
    }

    return space( callback );
  }

  within(WITHIN_ITSELF, function(publish, subscribe, get, set){
    set('missing', null); // prevent 'missing' property from missing itself
    publishWithinWithin = publish;
    set('version', WITHIN_VERSION);
    set('data', dataSpaces );
    set('subscribers', eventSpaces );
  });

  // export to global 'this'
  this.within = within;
});
