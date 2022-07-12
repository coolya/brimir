import { AstContainer, AstNode, Concept, ConceptRegistry } from "./AST";
import { BaseNode, RefImpl } from "./Runtime";

type NodeAsJson = {
	data: any,
	nodeId: string,
	concept: string
}

type RefAsJson = {
	_targetId: string
}

export function astToJson(nodeOrNodes: AstNode<Concept<string, any>, any> | AstNode<Concept<string, any>, any>[]): string {
	if (Array.isArray(nodeOrNodes)) {
		return JSON.stringify(nodeOrNodes.map(nodeToJsonData));
	}
	return JSON.stringify(nodeToJsonData(nodeOrNodes));
}

function nodeToJsonData(node: AstNode<Concept<string, any>, any>): NodeAsJson {
	let base = node as BaseNode
	return { data: base.data, nodeId: base.nodeId, concept: base.concept.conceptId }
}

export function astFromJson(json: string, container: AstContainer, registry: ConceptRegistry): AstNode<Concept<string, any>, any>[] {
	let parsed = JSON.parse(json);
	if (Array.isArray(parsed)) {
		return parsed.map(node => nodeFromJsonData(node, container, registry));
	} else {
		return [nodeFromJsonData(parsed, container, registry)];
	}
}

function nodeFromJsonData(node: NodeAsJson, container: AstContainer, registry: ConceptRegistry): AstNode<Concept<string, any>, any> {
	let concept = registry.getConcept(node.concept);
	let data = {}
	for (let prop in node.data) {
		if (Array.isArray(node.data[prop])) {
			data[prop] = node.data[prop].map(it => { nodeFromJsonData(it, container, registry) })
		} else if (typeof node.data[prop] === "object") {
			let it = node.data[prop]
			if (it["nodeId"] !== undefined) {
				data[prop] = nodeFromJsonData(node.data[prop], container, registry)
			} else {
				data[prop] = refFromJson(it, container)
			}
		} else {
			data[prop] = node.data[prop]
		}
	}

	let base = new BaseNode(concept!!, node.nodeId, data)
	container.addNode(base)
	return base;
}

function refFromJson(ref: RefAsJson, container: AstContainer): RefImpl<AstNode<any, any>> {
	return new RefImpl(container, ref._targetId);
}