import {v4 as uuidv4} from 'uuid';

export class Concept {
    conceptId: string
    container: AstContainer
    nodeId: string
}


type Own = {
    [key: string]: string | number | boolean | Concept | Concept[]
}

type ConceptId = "conceptId"

export type Reference = {
    [key: string]: Concept
}

export type MakeConcept<id extends string, Owned extends Own, Refs extends Reference> =
    {
        [Property in keyof Owned]: Owned[Property]
    }
    & {
    [R in keyof Refs]: Ref<Refs[R]>
}
    & Concept
    & {
    conceptId: id
    ref(): Ref<MakeConcept<id, Owned, Refs> & Concept>
}

export type MakeConceptExtension<Base extends Concept, id extends string, Owned extends Own, Refs extends Reference> =
    MakeConcept<id, Owned, Refs> & {
    [BP in keyof Base as Exclude<BP, ConceptId>]: Base[BP]
}

type ConceptWithOutId<T extends Concept> = {
    [BP in keyof T as Exclude<BP, ConceptId>]: T[BP]
}

export declare function castConcept<TargetConcept extends Concept, X extends ConceptWithOutId<TargetConcept>>(node: X): TargetConcept

type ReferenceValues<T extends Reference> = {
    [R in keyof T]: Ref<T[R]>
}

export function makeNode<ID extends string, T extends MakeConcept<ID, O, R>, O extends Own, R extends Reference>(owner: AstContainer, conceptId: ID, owned: O, refs: ReferenceValues<R>): T {
    let node = {
        ...owned,
        ...refs,
        conceptId,
        ref() {
            return new RefImpl<T>(owner, this)
        },
        nodeId: uuidv4()
    } as unknown as T
    owner.addNode(node)
    return node
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

interface Ref<T extends Concept> {
    value(): Promise<T>

    set(value: T)
}

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

export interface AstContainer {
    getNode(id: string): Promise<Concept>
    addNode(node: Concept)
}


