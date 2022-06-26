import {MakeConcept} from "../../dist/AST";


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