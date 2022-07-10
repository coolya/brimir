import {makeConcept} from "../../src";


type ConceptId = "concept"
const MyConcept = makeConcept<ConceptId, { name: string, age?: number, checkedId: boolean }>("concept")

let n: typeof MyConcept.nodeType = undefined


// access via type safe getters and setters

let name: string = n.get("name") // works

let age: number = n.get("age") // error because age is optional
let age2: number | undefined = n.get("age") // works

n.set("age", 42) // works
n.set("age", undefined) // works
n.set("age", "42") // error because age is a number

let checkedIn: boolean = n.get("checkedin") // error because the property name is wrong
