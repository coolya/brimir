import {MakeConcept} from "../../dist/AST";

type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyOtherConceptId = "my.other.concept"
type MyOtherConcept = MakeConcept<MyOtherConceptId,
    { child: MyConcept, children: MyConcept[], optional?: MyConcept },
    {}>

let n: MyOtherConcept = undefined

n.get("child").get("name").length
n.get("children").forEach(c => c.get("name").length)
n.get("optional")?.get("name").length