// https://github.com/eric-brechemier/within (License: CC0)
// within is a factory of semi-private spaces
// where properties and events can be shared.
// Usage: within("your.domain", function(get, set, publish, subscribe){ ... });

// from sub/nada/privately.js (CC0)
function privately( func ) {
  return func();
}

privately(function() {
  var
    dataSpaces = {},
    eventSpaces = {},
    has;

  // from sub/nada/no.js (CC0)
  function no( value ) {
    var undef; // do not trust global undefined, which can be set to a value
    return value === null || value === undef;
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

  /*
    Create a semi-private space to share properties and events

    Parameters:
      name - string, name of the symbolic space:
             a domain name and path that you control on the Web,
             followed with the name of the module.
             Example: "github.com/eric-brechemier/within/tests/module1"
      callback - function( get, set, publish, subscribe ), function called
                 immediately, in the context ('this') of an object,
                 always the same in each call of within with the same name,
                 and with four functions as arguments to share properties and
                 events within this module (described separately below).

    Returns:
      any, the value returned by the callback function
  */
  function within( name, callback ) {
    var
      dataSpace,
      eventSpace;

    if ( !has( dataSpaces, name ) ) {
      dataSpaces[ name ] = {};
      eventSpaces[ name ] = {};
    }

    dataSpace = dataSpaces[ name ];
    eventSpace = eventSpaces[ name ];

    /*
      Retrieve the value of a property previously set in this module

      Parameter:
        name - string, the name of a property of current module

      Returns:
        any, the value previously set to the property with given name,
        or null initially before any value has been set
    */
    function get( name ) {
      if ( !has( dataSpace, name ) ){
        return null;
      }
      return dataSpace[ name ];
    }

    /*
      Set the value of a property of the module

      Parameters:
        name - string, the name of a property in current module
        value - any, the new value of the property

      Note:
      Calling this function is equivalent to setting the property directly
      on the context object, and the function is only provided for symmetry
      with get().
    */
    function set( name, value ) {
      dataSpace[ name ] = value;
    }

    /*
      Set the value of a property and fire listeners registered for this event,
      in this module, and in this module only, until a listener returns true or
      all listeners have been called.

      Parameters:
        name - string, the name of an event and the associated property
        value - any, the new value of the property, also provided to listeners
    */
    function publish( name, value ) {
      var listeners;
      set( name, value );
      if ( !has( eventSpace, name ) ) {
        return;
      }
      listeners = copy( eventSpace[ name ] );
      forEach( listeners, function( listener ) {
        return listener( value );
      });
    }

    /*
      Register a callback function for the event of given name

      Parameters:
        name - string, the name of an event and the related property
        listener - function( value ), the callback triggered immediately

      Returns:
        function(), the function to call to remove current listener, which
        will no longer receive notifications for given event.

      Notes:
        1) Callbacks are triggered immediately when the value of the property
        is set, not null or undefined
        2) Callbacks are triggered when any value is published, even the same
        as current value, or null or undefined
        3) In case the same listener is registered multiple times, duplicate
        listeners for the same event are removed at the same time, while any
        subscription of the same listener to other events remains active.
    */
    function subscribe( name, listener ) {
      var listeners;
      if ( !has( eventSpace, name ) ) {
        eventSpace[ name ] = [];
      }
      listeners = eventSpace[ name ];
      listeners.push( listener );
      if ( has( dataSpace, name ) && !no( dataSpace[ name ] ) ) {
        listener( dataSpace[ name ] );
      }
      return function unsubscribe() {
        remove( listeners, listener );
      };
    }

    return callback.apply( dataSpace, [ get, set, publish, subscribe ] );
  }

  this.within = within;
});
