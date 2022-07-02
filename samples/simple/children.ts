import {MakeConcept} from "../../src/AST";

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