# Brimir

Brimir is a library to define and work with metamodels in TypeScript. It focuses on providing a developer experience that is "native" to TypeScript developers. 
The library make heavy use of TypeScripts type level programming to make definitions of the metamodel well integrated with other types. 



**While the library is published to npm registry, it is currently a proof of concept and everything is in flux. Prepare for regular breakage if you decide to 
play with it. Currently, no runtime implementation is available, and I'm merely exploring how far I can push the type system in TypeScript.**

## How to define a meta model

The `makeConcept` function takes to type arguments. The first type argument is the concept id which has to be a subtype of
string. The concept id is used to identify a concept a runtime. The second argument is an object type that defines the
"shape" of the concept. The object type has some constrains because brimir infers runtime behaviour from the shape of the
type. Every primitive type (`string`, `number` and `boolean`) are considered properties. Brimir will store properties
as part of the vertex in the AST. Every member of type `AstNode` is considered a separate vertex in the AST but is but the
has an implied life cycle dependency to its parent and are called children. Children can be optional or arrays.
Members of type `Ref` are considered references and a just pointers to other vertices in the AST which no lifecycle implications.

Here we define a concept with three properties:

```typescript
import { MakeConcept } from "brimir";

type ConceptId = "concept"
const MyConcept = makeConcept<ConceptId, { name: string, age?: number, checkedId: boolean }>("concept")
```

Accessing properties is done with generic `get` and `set` functions. The parameters to these function a statically 
constrained by the type system:

```typescript

let n: typeof MyConcept.nodeType = ...


// access via type safe getters and setters

let name: string = n.get("name") // works

let age: number = n.get("age") // error because age is optional
let age2: number | undefined = n.get("age") // works

n.set("age", 42) // works
n.set("age", undefined) // works
n.set("age", "42") // error because age is a number

let checkedIn: boolean = n.get("checkedin") // error because the property name is wrong


```

### Children

As mentioned above children are identified by their type. Access to children works in the same ways properties over 
the `get` and `set` methods. To make definition of children easier a concept exposes a property called `nodeType`. The 
`nodeType` represents the type for an instance of the concept and allows for easy definition of children on the object type
when used with the `typeOf` operator: 

```typescript
type MyConceptId = "my.concept"
const MyConcept = makeConcept<MyConceptId, { name: string }>("my.concept")

type MyOtherConceptId = "my.other.concept"
const MyOtherConcept = makeConcept<MyOtherConceptId,
	{ child: typeof MyConcept.nodeType, children: Array<typeof MyConcept.nodeType>, optional?: typeof MyConcept.nodeType}
	>("my.other.concept")

let n: typeof MyOtherConcept.nodeType = undefined

// access via type safe getters and setters

n.get("child").get("name").length
n.get("children").forEach(c => c.get("name").length)
n.get("optional")?.get("name").length

```

### References

References are specials because they are pointers to other vertices in the AST and don't carry any life cycle dependency.

Since resolving references can be expensive, Brimir exposes the value of a reference as a Promise. Accessing works similar to properties and children.
A reference is exposed via the `get` function. Setting the value happens on the reference object itself via `set`.

To help with the definition of references on a concept, each concept exposes a property `referenceType` which is useful 
in combination with the `typeOf` operator. 

```typescript

type MyConceptId = "my.concept"
const MyConcept = makeConcept<MyConceptId, { name: string }>("my.concept")

type MyOtherConceptId = "my.other.concept"
const MyOtherConcept = makeConcept<MyOtherConceptId, { reference: typeof MyConcept.referenceType, optionalReference?: typeof MyConcept.referenceType }>("my.other.concept")

type MyErrorConceptId = "my.error.concept"
const MyErrorConcept = makeConcept<MyErrorConceptId, { references: Array<typeof MyConcept.referenceType> }>("my.error.concept") //error, no arrays are allowed

let n: typeof MyOtherConcept.nodeType = undefined

n.get("reference").value().then(c => c.get("name").length)


// or using await
let v = await n.get("reference").value()

n.get("optionalReference")?.value().then(c => c?.get("name").length)

// or using await
let vOpt = await n.get("optionalReference")?.value()

if (vOpt) {
	vOpt.get("name").length
}
```

## Visiting the AST

The conceptId becomes important when we want to inspect the AST. In order to check if a `AstNode` is of a certain concept
the `isInstanceOf` function is used: 

```typescript

type MyConceptId = "my.concept"
const MyConcept = makeConcept<MyConceptId, { name: string }>("my.concept")

type MyOtherConceptId = "my.other.concept"
const MyOtherConcept = makeConcept<MyOtherConceptId,
	{ child:  typeof MyConcept.nodeType, children: typeof MyConcept.nodeType[], optional?: typeof MyConcept.nodeType}
	>("my.other.concept")

function visit(node: AstNode<any, any>) {
	if(isInstanceOf(MyConcept, node)) {
		node.get("name").length
	}
	if(isInstanceOf(MyOtherConcept, node)) {
		node.get("child").get("name").length
		node.get("children").forEach(c => c.get("name").length)
		node.get("optional")?.get("name").length
	}
}
```

## Serializing the AST

Brimir ships with basic support for JSON serialization and deserialization of an AST. 

Serialization works straight forward with the `astToJson` which returns a string representation of the AST:

```typescript
type MySimpleConceptId = "my.simple.concept"
const MySimpleConcept = makeConcept<MySimpleConceptId, { name: string }>("my.simple.concept")

const node = makeNodeWithId(MySimpleConcept, "42", { name: "John" })
const str = astToJson(node) // {"data":{"name":"John"},"nodeId":"42","concept":"my.simple.concept"}
```
Deserialization works in a similar way be requires a bit more context information. First of all a `ConceptRegistry` is required
which needs to know all the concepts that are part of the JSON. This is used to retrieve the concepts based on their id during
the deserialization process. Second a `AstContainer` is required. The AstContainer stores all known nodes and allows to retrieve 
them by id. This is required when references are part of the serialized AST. If the serialized AST references nodes that aren't 
part of the serialized JSON then the AstContainer needs to know these nodes as well.

The `astFromJson` function always returns a list of nodes even if only one node is deserialized: 

```typescript

class Container implements AstContainer {
	nodes: Map<string, AstNode<Concept<string, any>, any>> = new Map()
	getNode(id: string): Promise<AstNode<any, any> | undefined> {
		return Promise.resolve(this.nodes.get(id))
	}
	addNode(node: AstNode<any, any>): void {
		this.nodes.set(node.nodeId, node)
	}
}

const registry = new class implements ConceptRegistry {
	data = new Map<string, Concept<string, any>>()
	getConcept<Id extends string, P extends Props>(id: Id): Concept<Id, P> | undefined {
		return this.data.get(id) as Concept<Id, P>
	}
	registerConcept<Id extends string, P extends Props>(c: Concept<Id, P>): void {
		this.data.set(c.conceptId, c)
	}
}

registry.registerConcept(MySimpleConcept)

const container = new Container()
const nodeS = astFromJson(`{"data":{"name":"John"},"nodeId":"42","concept":"my.simple.concept"}`, container, registry)
```
