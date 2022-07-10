import {makeConcept} from "../../src";


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