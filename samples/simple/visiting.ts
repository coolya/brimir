import {MakeConcept} from "../../dist/AST";

type MyConceptId = "my.concept"
type MyConcept = MakeConcept<MyConceptId, { name: string }, {}>

type MyOtherConceptId = "my.other.concept"
type MyOtherConcept = MakeConcept<MyOtherConceptId,
    { child: MyConcept, children: MyConcept[], optional?: MyConcept },
    {}>

type MetaModel = MyConcept | MyOtherConcept

function visit(node: MetaModel) {
    switch (node.conceptId) {
        case "my.concept":
            node.get("name").length
            break
        case "my.other.concept":
            node.get("child").get("name").length
            node.get("children").forEach(c => c.get("name").length)
            node.get("optional")?.get("name").length
            break
    }
}