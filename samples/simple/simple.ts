import {MakeConcept} from "../../dist/AST";


type ConceptId = "concept"
type Concept = MakeConcept<ConceptId, { name: string, age?: number, checkedIn: boolean}, {}>

let n : Concept = undefined

let name : string = n.get("name")
let age : number | undefined = n.get("age")
let checkedIn : boolean = n.get("checkedin") // error