import {v4 as uuidv4} from 'uuid';
import {AstContainer, Concept, MakeConcept, Own, Ref, Reference} from "./AST";


class RefImpl<T extends Concept> implements Ref<T> {
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
        return {target: this._targetId}
    }
}

export class NodeImpl extends Concept {
    override conceptId: string
    override container: AstContainer
    override nodeId: string
    readonly owned: any
    readonly refs: any

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
    }

    on(name: string, callback: (newValue: any) => void) {

    }

    ref(): Ref<NodeImpl> {
        return new RefImpl(this.container, this)
    }

    toJSON() {

    }
}

type ReferenceValues<T extends Reference> = {
    [R in keyof T]: Ref<T[R]>
}

export function makeNode<ID extends string, T extends MakeConcept<ID, O, R>, O extends Own, R extends Reference>(owner: AstContainer, conceptId: ID, owned: O, refs: ReferenceValues<R>): T {
    const node = new NodeImpl(owner, conceptId, uuidv4(), owned, refs)

    const p = new Proxy(node, {
        get(target: NodeImpl, p: string | symbol): any {
            if(p in target) {
                return target[p]
            }
            return target.get(p.toString())
        },
        set(target: NodeImpl, p: string | symbol, value: any): boolean {
            target.set(p.toString(), value)
            return true
        },
    })

    owner.addNode(node)
    return p as unknown as T
}

export function makeNodeWithId<ID extends string, T extends MakeConcept<ID, O, R>, O extends Own, R extends Reference>(owner: AstContainer, conceptId: ID, nodeId: string, owned: O, refs: ReferenceValues<R>): T {
    return {
        ...owned,
        ...refs,
        conceptId,
        ref() {
            return new RefImpl<T>(owner, this)
        },
        nodeId: nodeId
    } as unknown as T
}