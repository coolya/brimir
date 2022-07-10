import {AstNode, isInstanceOf, makeConcept} from "../../src";

type MyConceptId = "my.concept"
const MyConcept = makeConcept<MyConceptId, { name: string }>("my.concept")

type MyOtherConceptId = "my.other.concept"
const MyOtherConcept = makeConcept<MyOtherConceptId,
	{ child: typeof MyConcept.nodeType, children: typeof MyConcept.nodeType[], optional?: typeof MyConcept.nodeType }>("my.other.concept")

function visit(node: typeof MyConcept.nodeType | typeof MyOtherConcept.nodeType) {
	if (isInstanceOf(MyConcept, node)) {
		node.get("name").length
	}
	if (isInstanceOf(MyOtherConcept, node)) {
		node.get("child").get("name").length
		node.get("children").forEach(c => c.get("name").length)
		node.get("optional")?.get("name").length
	}
}