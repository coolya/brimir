import {MakeConcept} from "../../src/AST";


type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyOtherConceptId = "my.other.concept"
type MyOtherConcept = MakeConcept<MyOtherConceptId, {}, { reference: MyConcept, optionalReference?: MyConcept }>

type MyErrorConceptId = "my.error.concept"
type MyErrorConcept = MakeConcept<MyErrorConceptId, {}, { references: MyConcept[]  }> //error, no arrays are allowed

type MyErrorConcept = MakeConcept<MyErrorConceptId, {}, { primitive: string  }> //error, primitives are not allowed

let n : MyOtherConcept = undefined

n.get("reference").value().then(c => c.get("name").length)
n.reference.value().then(c => c.get("name").length)

// or using await
let v = await n.get("reference").value()
let v2 = await n.reference.value()

n.get("optionalReference").value().then(c => c?.get("name").length)

// or using await
let vOpt = await n.get("optionalReference").value()
let vOpt2 = await n.optionalReference?.value()

if(vOpt) {
    vOpt.get("name").length
}