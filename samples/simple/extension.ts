import {castConcept, MakeConcept, MakeConceptExtension, Concept, isInstanceOf} from "../../src/AST";


type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyExtendingConceptId = "my.extending.concept"
type MyExtendingConcept = MakeConceptExtension<MyConcept,MyExtendingConceptId, {}, {}>

let n : MyExtendingConcept = undefined

n.get("name")



let m : MyConcept = castConcept(n)

let c : Concept = m

if(isInstanceOf<MyConcept>("my.concept", c)) {
}
