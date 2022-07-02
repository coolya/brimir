# Brimir

Brimir is a library to define and work with metamodels in TypeScript. It focuses on providing a developer experience that is "native" to TypeScript developers. 
The library make heavy use of TypeScripts type level programming to make definitions of the metamodel well integrated with other types. 

**While the library is published to npm registry, it is currently a proof of concept and everything is in flux. Prepare for regular breakage if you decide to 
play with it. Currently, no runtime implementation is available, and I'm merely exploring how far I can push the type system in TypeScript.**

## How to define a meta model

Concepts are created as types. A concept is constructed from three parts: a concept id, the own properties and children,
and references to other concepts. The concept id is a string used to identify the concept. The own properties and children 
are an object type with properties of primitive types or other concepts. 

Here we define a concept with three properties:

```typescript
import { MakeConcept } from "brimir";

type ConceptId = "concept"
type Concept = MakeConcept<ConceptId, { name: string, age?: number, checkedIn: boolean}, {}>
```
Properties and children can be read only and/or optional just like any other type.

The properties and children as exposed via normal properties on the resulting type. Allowing for easy exploration via intelli sense.


```typescript

let n : Concept = ...


// access via properties

const nameLength = n.name.length

n.age = 42
n.age = "69" //error, age is number
n.age = undefined // works because age is optional

const isNiceAge = n.age === 69

if(n.checkedIn) {
    console.log(`${n.name} is checked in`)
}

```
Alternatively access to properties and children is possible through the `get` and `set` function. While this might seem error-prone, it is not thanks to
the powerful type system of TypeScript. Because the possible values for the `name` parameter of the `get` or `set` function are restricted to
the values defined on the concept and the return/argument type is inferred.

```typescript

// access via type safe getters and setters

let name : string = n.get("name") // works

let age : number = n.get("age") // error because age is optional
let age2 : number | undefined= n.get("age") // works

n.set("age", 42) // works
n.set("age", undefined) // works
n.set("age", "42") // error because age is a number

let checkedIn : boolean = n.get("checkedin") // error because the property name is wrong

```

### Children

Children are also just properties on the object type used to define the concept. Similar to properties, access to children is possible via normal properties or getters and setters.

```typescript
import { MakeConcept } from "brimir";

type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyOtherConceptId = "my.other.concept"
type MyOtherConcept = MakeConcept<MyOtherConceptId,
    { child: MyConcept, children: MyConcept[], optional?: MyConcept },
    {}>

let n: MyOtherConcept = undefined

// access via properties

const nameLength = n.child.name.length
const allNamesSum = n.children.reduce((acc, c) => acc + c.name.length, 0)
const optionalNameLength = n.optional?.name.length

// access via type safe getters and setters

n.get("child").get("name").length
n.get("children").forEach(c => c.get("name").length)
n.get("optional")?.get("name").length

```

Of course children can be arrays or optional.

### References

References are specials because they are pointers to other instances of a concept and have in dependent life cycle 
from the referencing instance. Therefor, references are defined via a separate type parameter. The properties on the 
object type used to define the references are only allowed to be other concepts.

Since resolving references can be expensive, Brimir exposes the value of a reference as a Promise. Accessing works similar to properties and children.
A reference is exposed via property on the type or via the `get` function. Setting the value happens on the reference object itself via `set`.

```typescript
import { MakeConcept } from "brimir";

type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyOtherConceptId = "my.other.concept"
type MyOtherConcept = MakeConcept<MyOtherConceptId, {}, { reference: MyConcept, optionalReference?: MyConcept }>

type MyErrorConceptId = "my.error.concept"
type MyErrorConcept = MakeConcept<MyErrorConceptId, {}, { references: MyConcept[]  }> //error, no arrays are allowed

type MyErrorConcept = MakeConcept<MyErrorConceptId, {}, { primitive: string  }> //error, primitives are not allowed

let n : MyOtherConcept = undefined

n.get("reference").value().then(c => c.get("name").length)
n.reference.value().then(c => c.get("name").length)

// or using await
let v = await n.get("reference").value()
let v2 = await n.reference.value()

n.get("optionalReference").value().then(c => c?.get("name").length)

// or using await
let vOpt = await n.get("optionalReference").value()
let vOpt2 = await n.optionalReference?.value()

if(vOpt) {
    vOpt.get("name").length
}
```

## Visiting the AST

The conceptId becomes important when we want to inspect the AST. By encoding the conceptId as a type we can use it inside
a `switch` statement and get typesafe access to the AST. The set of available concepts is encoded as a union type.

```typescript
import { MakeConcept } from "brimir";


type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyOtherConceptId = "my.other.concept"
type MyOtherConcept = MakeConcept<MyOtherConceptId,
    { child: MyConcept, children: MyConcept[], optional?: MyConcept },
    {}>

type MetaModel = MyConcept | MyOtherConcept

function visit(node: MetaModel) {
    switch (node.conceptId) {
        case "my.concept":
            node.get("name").length
            break
        case "my.other.concept":
            node.get("child").get("name").length
            node.get("children").forEach(c => c.get("name").length)
            node.get("optional")?.get("name").length
            break
    }
}
```