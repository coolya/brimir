import { v4 as uuidv4 } from 'uuid';
import { AstContainer, AstNode, Concept, Props, Ref } from "./AST";


class RefImpl<T extends AstNode<any, any>> implements Ref<T> {
	_value?: T
	_targetId: string
	_owner: AstContainer

	constructor(owner: AstContainer, target: T | string) {
		if (typeof target === 'string') {
			this._targetId = target
		} else if (target != undefined) {
			this._value = target
			this._targetId = target.nodeId
		} else {
			throw new Error('target must be a string or a concept')
		}
		this._owner = owner
	}


	value(): Promise<T> {
		return new Promise(resolve => {
			if (this._value) {
				resolve(this._value)
			} else {
				this._owner.getNode(this._targetId).then(value => {
					this._value = value as T
					resolve(value as T)
				}
				)
			}
		})
	}

	set(value: T) {
		this._value = value
	}

	toJSON() {
		return { _targetId: this._targetId }
	}
}

export function isInstanceOf<P extends Props, Id extends string>(c: Concept<Id, P>, node: AstNode<Concept<string, any>, Props>): node is AstNode<Concept<Id, P>, P> {
	return node.concept.isSubConceptOf(c)
}

export class BaseNode {
	concept: Concept<string, any>
	#owner: AstContainer
	#data: any
	nodeId: string
	#listeners: Array<{ prop: string, callback: (node: BaseNode, newValue: any, oldValue: any) => void }> = []

	constructor(c: Concept<string, any>, nodeId: string, data: any) {
		this.nodeId = nodeId
		this.#data = data
		this.concept = c
	}

	get(name: string): any {
		return this.#data[name]
	}

	set(name: string, value: any) {
		let oldValue = this.#data[name]
		this.#data[name] = value
		this.#trigger(name, oldValue, value)
	}

	on(prop: string, callback: (node: AstNode<Concept<string, any>, any>, newValue: any, oldValue: any) => void) {
		this.#listeners.push({ prop: prop, callback: callback })
	}

	#trigger(prop: string, oldValue: any, newValue: any) {
		this.#listeners.slice(0).filter(x => x.prop === `${prop}Changed`).forEach(x => {
			x.callback(this, newValue, oldValue)
		})
	}

	ref() {
		return new RefImpl(this.#owner, this)
	}
}

class NodeImpl<Id extends string, P extends Props> extends BaseNode {
	override concept: Concept<Id, P>

	constructor(c: Concept<Id, P>, nodeId: string, data: P) {
		super(c, nodeId, data);
	}

	override on(prop: string, callback: (node: AstNode<Concept<Id, P>, P>, newValue: any, oldValue: any) => void) {
		super.on(prop, callback)
	}
}

class RuntimeConcept<Id extends string, P extends Props> {
	conceptId: Id
	superConcept: RuntimeConcept<string, any> | undefined

	constructor(id: Id, superConcept: RuntimeConcept<string, any> | undefined) {
		this.conceptId = id
		this.superConcept = superConcept
	}

	isSubConceptOf<OtherId extends string, OtherProps extends P>(other: Concept<OtherId, OtherProps>): boolean {
		let c: RuntimeConcept<any, any> | undefined = this
		while (c) {
			if (c.conceptId === other.conceptId) {
				return true
			}
			c = c.superConcept
		}
		return false
	}

	extendWith<ExId extends string, ExProps extends Props>(id: ExId): Concept<ExId & Id, P & ExProps> {
		return new RuntimeConcept(id, this) as Concept<ExId & Id, P & ExProps>
	}

	declare nodeType
	declare referenceType
}

export function makeConcept<Id extends string, P extends Props>(id: Id): Concept<Id, P> {
	return new RuntimeConcept(id, undefined) as Concept<Id, P>
}

export function makeNode<Id extends string, P extends Props>(c: Concept<Id, P>, data: P): AstNode<Concept<Id, P>, P> {
	return new NodeImpl(c, uuidv4(), data)
}


