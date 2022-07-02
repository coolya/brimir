import {MakeConcept} from "../../src/AST";


type ConceptId = "concept"
type Concept = MakeConcept<ConceptId, { name: string, age?: number, checkedIn: boolean}, {}>

let n : Concept = undefined

// access via properties

const nameLength = n.name.length

n.age = 42
n.age = "69" //error, age is number
n.age = undefined // works because age is optional

const isNiceAge = n.age === 69

if(n.checkedIn) {
    console.log(`${n.name} is checked in`)
}

// access via type safe getters and setters

let name : string = n.get("name") // works

let age : number = n.get("age") // error because age is optional
let age2 : number | undefined= n.get("age") // works

n.set("age", 42) // works
n.set("age", undefined) // works
n.set("age", "42") // error because age is a number

let checkedIn : boolean = n.get("checkedin") // error because the property name is wrong
