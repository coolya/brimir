import {MakeConcept, AstContainer, Concept} from "../src";
import {makeNode} from "../src";
import {expect} from "chai";

type MySimpleConceptId = "my.simple.concept"
type MySimpleConcept = MakeConcept<MySimpleConceptId, { name: string }, {}>

const container : AstContainer = new class implements AstContainer {
    addNode(node: Concept) {
    }
    getNode(id: string): Promise<Concept> {
        throw new Error("Method not implemented.");
    }
}

describe('node', function() {
    const n = makeNode(container, "my.simple.concept", {name: "John"}, {})
    it('access name', function() {
        expect(n.name).equal("John");
    });

    it('set name', function() {
        n.name = "Jane";
        expect(n.name).equal("Jane");
    });
});




