plan(28);

Type("Integer", {
    where: /^-*\d+$/
})

ok(TYPE, "We have a TYPE Module");

ok(TYPE.Integer, "The new type is there");

ok(TYPE.Integer.validate(123), "It matches valid input")

fail(function () {TYPE.Integer.validate("hallo")}, "The passed value ", "It fails on invalid input")

Module("MyTypes", function () {
    Type("PositiveInteger", {
        isa: TYPE.Integer,
        where: function (value) {
            return value > 0
        }
    })
})

ok(MyTypes.PositiveInteger, "Type in custom module is here")
ok(MyTypes.PositiveInteger.validate(10), "It validates valid input")

fail(function () {MyTypes.PositiveInteger.validate(-10)}, "The passed value ", "It fails on invalid input (subtype)")
fail(function () {MyTypes.PositiveInteger.validate("hallo")}, "The passed value ", "It fails on invalid input (supertype)")

ok(MyTypes.PositiveInteger.validate("1325135"), "It validates valid input")
fail(function () {MyTypes.PositiveInteger.validate("123.12")}, "The passed value ", "It fails on invalid input ")

diag("Type Coercion")

Module("MyTypes", function () {
    Type("PositiveIntegerWithCoercion", {
        isa: TYPE.Integer,
        where: function (value) {
            return value > 0
        },
        coerce: [{
            from: TYPE.Integer,
            via:  function (value) {
                return Math.abs(value)
            }
        }]
    })
})

ok(MyTypes.PositiveIntegerWithCoercion, "Type with Coercion is here");
canOk(MyTypes.PositiveIntegerWithCoercion, "coerce")
var value = MyTypes.PositiveIntegerWithCoercion.coerce(-10);
isEq(value, 10, "Coercion works")
var value = MyTypes.PositiveIntegerWithCoercion.coerce("one")
ok(value == null, "Does not coerce wrong values")
var value = MyTypes.PositiveIntegerWithCoercion.coerce(100)
isEq(value, 100, "Leaves correct values alone")

// now just test plain vanilla type constraints in class attributes
diag('type constrained vanilla class attributes');

Type('BooleanTest', {
    where: function(value) {
        if (typeof value == 'boolean') {
            return true;
        }
        return false;
    },
    coerce: [{
            from: TYPE.Integer,
             via:  function (value) {
                if ( value == 0 )
                    return false;
                return true;
            }
        }]
    }
);

Class("BooleanTypeConstrained", {
    has: {
        attr1: {
            is: 'rw',
            isa: TYPE.BooleanTest,
            coerce: true
        }
    }
})


var constrained = new BooleanTypeConstrained({attr1: false});
ok(constrained.getAttr1() == false, "setting boolean constrained to false in constructor succeeds")

ok(constrained.setAttr1(true), 'setting boolean constrained to true succeeds');
fail(function () { constrained.setAttr1('foo')}, 
    'The passed value [foo] is not a BooleanTest', 
    'setting boolean constrained to foo fails');
constrained.setAttr1('foo', function (e, type) {
	ok(type == TYPE.BooleanTest, "Error handler invoked with correct type")
})

fail(function () { new BooleanTypeConstrained({attr1: 'foo'})}, 
    'The passed value [foo] is not a BooleanTest', 
    'setting boolean constrained to foo in constructor fails');

fail(function () { new BooleanTypeConstrained({attr1: "one"}) }, 
    'The passed value [one] is not a BooleanTest', 
    'newing up a boolean constrained with non boolean value fails');
    
ok(constrained.setAttr1(1), 'setting boolean to 1 succeeds');
ok(constrained.getAttr1() !== 1, '...but value was not actually set to 1');
ok(constrained.getAttr1() === true, '1 coerces to boolean true');

ok(constrained.setAttr1(0), 'setting boolean to 0 succeeds');
ok(constrained.getAttr1() !== 0, '...but value was not actually set to 0');
ok(constrained.getAttr1() === false, '0 coerces to boolean false');

ok(new BooleanTypeConstrained({attr1: 1}).getAttr1() == true, "setting boolean to 1 coerces to true in constructor")

//TODO(jwall): attribute coercion tests

endTests()
