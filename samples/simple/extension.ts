import {castConcept, MakeConcept, MakeConceptExtension} from "../../src/AST";

type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyExtendingConceptId = "my.extending.concept"
type MyExtendingConcept = MakeConceptExtension<MyConcept,MyExtendingConceptId, {}, {}>

let n : MyExtendingConcept = undefined

n.get("name")



let m : MyConcept = castConcept(n)
