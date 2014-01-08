Object.prototype.parent = function() {
    var fn = arguments.callee.caller;
    if (!fn._super) return;
    return fn._super.apply(this, arguments);
}

Function.prototype._inherits = function(superclass, implementation) {
    implementation.constructor = this;
    this.prototype = implementation;

    for (var k in implementation) {
        if (implementation[k] instanceof Function && superclass.prototype[k] instanceof Function) {
            implementation[k]._super = superclass.prototype[k]; 
        }
    }
    this.prototype.__proto__ = superclass.prototype;

    return this;
}

function $class(sclass, impl) {
    (impl != null) || (impl = sclass, sclass = Object);
    return (function() {
        this.init && this.init.apply(this, arguments);
    })._inherits(sclass, impl);
}
