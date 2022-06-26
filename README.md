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

Access to properties and children is done through the `get` and `set` function. While this might seem error prone, it is not thanks to
the powerful type system of TypeScript. Because the possible values for the `name` parameter of the `get` or `set` function are restricted to 
the values defined on the concept and the return/argument type is inferred.

```typescript

let n : Concept = ...


let name : string = n.get("name") // works

let age : number = n.get("age") // error because age is optional
let age2 : number | undefined= n.get("age") // works

n.set("age", 42) // works
n.set("age", undefined) // works
n.set("age", "42") // error because age is a number

let checkedIn : boolean = n.get("checkedin") // error because the property name is wrong

```

### Children

Children are also just properties on the object type used to define the concept. 

```typescript
import { MakeConcept } from "brimir";

type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyOtherConceptId = "my.other.concept"
type MyOtherConcept = MakeConcept<MyOtherConceptId,
    { child: MyConcept, children: MyConcept[], optional?: MyConcept },
    {}>

let n: MyOtherConcept = undefined

n.get("child").get("name").length
n.get("children").forEach(c => c.get("name").length)
n.get("optional")?.get("name").length

```

Of course properties can be arrays or optional. Access works in the same as for primitive values via the `get` function.

### References

References are specials because they are pointers to other instances of a concept and have in dependent life cycle 
from the referencing instance. Therefor, references are defined via a separate type parameter. The properties on the 
object type used to define the references are only allowed to be other concepts.

Since resolving references can be expensive, Brimir exposes the value of a reference as a Promise. Accessing a reference
also works via the `get` function, but setting the value happens on the reference object itself via `set`.

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
n.get("optionalReference").value().then(c => c?.get("name").length)

```

## Visiting the AST

The conceptId becomes important when we want to inspect the AST. By encoding the conceptId as a type we can use it inside
a `swith` statement and get typesafe access to the AST. The set of available concepts is encoded as a union type.

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