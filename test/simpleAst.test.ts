import { AstContainer, AstNode, makeConcept } from "../src";
import { makeNode } from "../src";
import { expect } from "chai"
import { it } from "mocha";

type MySimpleConceptId = "my.simple.concept"
const MySimpleConcept = makeConcept<MySimpleConceptId, { name: string }>("my.simple.concept")

const container: AstContainer = new class implements AstContainer {
	addNode(node: AstNode<any, any>): void {
	}

	getNode(id: string): Promise<AstNode<any, any>> {
		throw Error("Method not implemented")
	}

}

describe("simple node", function () {
	const n = makeNode(MySimpleConcept, { name: "John" })
	it("access name", function () {
		expect(n.get("name")).equal("John")
	});

	it("set name", function () {
		n.set("name", "Jane")
		expect(n.get("name")).equal("Jane")
	});
	it("notification works", function () {
		let called = false
		n.on("nameChanged", function (source, newValue, oldValue) {
			expect(source.nodeId).equal(n.nodeId)
			expect(newValue).equal("Johny")
			expect(source.get("name")).equal("Johny")
			expect(source).equal(n)
			called = true
		})
		n.set("name", "Johny")
		expect(called).equal(true)
	})
	it("concept is correct", () => {
		expect(n.concept).equal(MySimpleConcept)
	})
});






