import { expect } from "chai"
import { makeConcept, makeNode } from "../src"


type MyConceptId = "my.concept"
const MyConcept = makeConcept<MyConceptId, { name: string }>("my.concept")
type MyConceptType = typeof MyConcept.nodeType

type MyExtendingId = "my.concept.extension"
const MyExtendingConcept = MyConcept.extendWith<MyExtendingId, { age: number }>("my.concept.extension")

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
})