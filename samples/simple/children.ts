import {makeConcept} from "../../src";

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