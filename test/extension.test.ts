import { expect } from "chai"
import { isInstanceOf, makeConcept, makeNode } from "../src"


type MyConceptId = "my.concept"
const MyConcept = makeConcept<MyConceptId, { name: string }>("my.concept")
type MyConceptType = typeof MyConcept.nodeType

type MyExtendingId = "my.concept.extension"
const MyExtendingConcept = MyConcept.extendWith<MyExtendingId, { age: number }>("my.concept.extension")

type UnrelatedConceptId = "unrelated.concept"
const UnrelatedConcept = makeConcept<UnrelatedConceptId, { name: string }>("unrelated.concept")

function getName(node: MyConceptType): string {
	return node.get("name")
}

describe("extended concept", () => {
	const node = makeNode(MyExtendingConcept, { name: "John", age: 42 })
	it("accessing name", () => {
		expect(node.get("name")).equals("John")
	})
	it("accessing name on base concept", () => {
		expect(getName(node)).equals("John")
	})
	it("accessing not inherited property", () => {
		expect(node.get("age")).equals(42)
	})
	it("subscribing to inherited propertey", () => {
		let called = false
		node.on("nameChanged", (source, newValue, oldValue) => {
			expect(source.nodeId).equals(node.nodeId)
			expect(newValue).equals("Johny")
			expect(oldValue).equals("John")
			expect(source).equals(node)
			called = true
		})
		node.set("name", "Johny")
		expect(called).equals(true)
	})
	it("subscribing to not inherited propertey", () => {
		let called = false
		node.on("ageChanged", (source, newValue, oldValue) => {
			expect(source.nodeId).equals(node.nodeId)
			expect(newValue).equals(69)
			expect(oldValue).equals(42)
			expect(source).equals(node)
			called = true
		})
		node.set("age", 69)
		expect(called).equals(true)
	})

	it("is instance of super", () => {
		expect(isInstanceOf(MyConcept, node)).equals(true)
	})

	it("is instance of extended concept", () => {
		expect(isInstanceOf(MyExtendingConcept, node)).equals(true)
	})

	it("is not instance of unrelated", () => {
		expect(isInstanceOf(UnrelatedConcept, node)).equals(false)
	})

	it("concept instance is correct", () => {
		expect(node.concept).equals(MyExtendingConcept)
		expect(node.concept).not.equals(MyConcept)
	})
})