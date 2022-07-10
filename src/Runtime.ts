import {v4 as uuidv4} from 'uuid';
import {AstContainer, AstNode, Concept, Props, Ref} from "./AST";


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
        return {_targetId: this._targetId}
    }
}

export function isInstanceOf<P extends Props, Id extends string>(c: Concept<Id, P>, node: AstNode<Concept<string, any>, Props>): node is AstNode<Concept<Id, P>, P> {
    return true
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
        this.#listeners.push({prop: prop, callback: callback})
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
        return true
    }

    extendWith<ExId extends string, ExProps extends Props>(id: ExId): Concept<ExId, P & ExProps> {
        return new RuntimeConcept(id, this)
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


/*


export class NodeImpl extends Concept {
    override conceptId: string
    override container: AstContainer
    override nodeId: string
    readonly owned: any
    readonly refs: any
    handlers: Array<{ prop: string, handler: (source: any, data: any) => void }> = [];

    constructor(owner: AstContainer, conceptId: string, nodeId: string, owned: any, refs: any) {
        super()
        this.conceptId = conceptId
        this.container = owner
        this.nodeId = nodeId
        this.owned = owned
        this.refs = refs
    }

    get(name: string): any {
        if (this.owned[name] != undefined) {
            return this.owned[name]
        }
        return this.refs[name]
    }

    set(name: string, value: any) {
        this.owned[name] = value
        this.#trigger(`${name}Changed`, value)
    }

    #trigger(prop: string, propValue: any): void {
        this.handlers.slice(0).filter(h => h.prop === prop).map(h => h.handler(this, propValue))
    }

    on(name: string, callback: (source: any, newValue: any) => void) {
        this.handlers.push({prop: name, handler: callback})
    }

    ref(): Ref<NodeImpl> {
        return new RefImpl(this.container, this)
    }

    toJSON() {
        return {conceptId: this.conceptId, nodeId: this.nodeId, owned: this.owned, refs: this.refs}
    }
}

type ReferenceValues<T extends Reference> = {
    [R in keyof T]: Ref<T[R]>
}

export function makeNode<ID extends string, T extends MakeConcept<ID, O, R>, O extends Own, R extends Reference>(owner: AstContainer, conceptId: ID, owned: O, refs: ReferenceValues<R>): T {
    return makeNodeWithId(owner, conceptId, uuidv4(), owned, refs)
}

export function makeNodeWithId<ID extends string, T extends MakeConcept<ID, O, R>, O extends Own, R extends Reference>(owner: AstContainer, conceptId: ID, nodeId: string, owned: O, refs: ReferenceValues<R>): T {
    const node = new NodeImpl(owner, conceptId, nodeId, owned, refs)

    const proxy = new Proxy(node, {
        get(target: NodeImpl, p: string | symbol): any {
            if (p in target) {

                // on needs special handling because we need to inject the proxy instead of the storage node.
                if(p === "on") {
                    return function (name: string, callback: (source: any, newValue: any) => void) {
                        target.on(name, function (source: any, newValue: any) {
                            callback(proxy, newValue)
                        })
                    }
                } else {
                    return target[p]
                }
            }
            return target.get(p.toString())
        },
        set(target: NodeImpl, p: string | symbol, value: any): boolean {
            target.set(p.toString(), value)
            return true
        },
    })

    owner.addNode(node)
    return proxy as unknown as T
}*/