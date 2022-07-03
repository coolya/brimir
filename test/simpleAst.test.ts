import {MakeConcept, AstContainer, Concept} from "../src";
import {makeNode} from "../src";
import {expect} from "chai";
import {it} from "mocha";

type MySimpleConceptId = "my.simple.concept"
type MySimpleConcept = MakeConcept<MySimpleConceptId, { name: string }, {}>

const container: AstContainer = new class implements AstContainer {
    addNode(node: Concept) {
    }

    getNode(id: string): Promise<Concept> {
        throw new Error("Method not implemented.");
    }
}

describe("simple node", function () {
    const n = makeNode(container, "my.simple.concept", {name: "John"}, {})
    it("access name", function () {
        expect(n.name).equal("John")
    });

    it("set name", function () {
        n.name = "Jane"
        expect(n.name).equal("Jane")
    });
    it("notification works", function () {
        let called = false
        n.on("nameChanged", function (source, newValue) {
            expect(source.nodeId).equal(n.nodeId)
            expect(newValue).equal("Johny")
            expect(source.name).equal("Johny")
            called = true
        })
        n.name = "Johny"
        expect(called).equal(true)
    })
});




