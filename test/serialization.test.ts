import { expect } from "chai"
import { describe } from "mocha"
import { AstContainer, astFromJson, AstNode, astToJson, Concept, ConceptRegistry, isInstanceOf, makeConcept, makeNodeWithId, Props } from "../src"


type MySimpleConceptId = "my.simple.concept"
const MySimpleConcept = makeConcept<MySimpleConceptId, { name: string }>("my.simple.concept")

type MyComplexConceptId = "my.complex.concept"
const MyComplexConcept = makeConcept<MyComplexConceptId, { name: string, refToOther: typeof MySimpleConcept.referenceType }>("my.complex.concept")

class Container implements AstContainer {
	nodes: Map<string, AstNode<Concept<string, any>, any>> = new Map()
	getNode(id: string): Promise<AstNode<any, any> | undefined> {
		return Promise.resolve(this.nodes.get(id))
	}
	addNode(node: AstNode<any, any>): void {
		this.nodes.set(node.nodeId, node)
	}
}


const registry = new class implements ConceptRegistry {
	data = new Map<string, Concept<string, any>>()
	getConcept<Id extends string, P extends Props>(id: Id): Concept<Id, P> | undefined {
		return this.data.get(id) as Concept<Id, P>
	}
	registerConcept<Id extends string, P extends Props>(c: Concept<Id, P>): void {
		this.data.set(c.conceptId, c)
	}
}

registry.registerConcept(MySimpleConcept)
registry.registerConcept(MyComplexConcept)


describe("serialization", () => {
	it("serialization", () => {
		const node = makeNodeWithId(MySimpleConcept, "42", { name: "John" })
		const str = astToJson(node)
		expect(str).equals(`{"data":{"name":"John"},"nodeId":"42","concept":"my.simple.concept"}`)
	})
	it("serialization with reference", () => {
		const refTarget = makeNodeWithId(MySimpleConcept, "69", { name: "John" })
		const node = makeNodeWithId(MyComplexConcept, "42", { name: "John", refToOther: refTarget.ref() })
		const str = astToJson([node, refTarget])
		expect(str).equals(`[{"data":{"name":"John","refToOther":{"_targetId":"69"}},"nodeId":"42","concept":"my.complex.concept"},{"data":{"name":"John"},"nodeId":"69","concept":"my.simple.concept"}]`)
	})
	it("deserialization", () => {
		const container = new Container()
		const node = astFromJson(`{"data":{"name":"John"},"nodeId":"42","concept":"my.simple.concept"}`, container, registry)[0]
		expect(node.concept.conceptId).equals("my.simple.concept")
		expect(node.nodeId).equals("42")
		expect(node.get("name")).equals("John")
	})
	it("deserialization with reference", async () => {
		const container = new Container()
		const node = astFromJson(`[{"data":{"name":"John","refToOther":{"_targetId":"69"}},"nodeId":"42","concept":"my.complex.concept"},{"data":{"name":"John"},"nodeId":"69","concept":"my.simple.concept"}]`, container, registry)[0]
		if(isInstanceOf(MyComplexConcept, node)) {
			expect(node.concept.conceptId).equals("my.complex.concept")
			expect(node.nodeId).equals("42")
			expect(node.get("name")).equals("John")
			let refTarget = await node.get("refToOther").value()
			expect(refTarget).not.undefined
			expect(isInstanceOf(MySimpleConcept, refTarget)).true
		} else {
			expect.fail()
		}
	})
})