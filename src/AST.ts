export class Concept {
    conceptId: string
}


type Own = {
    [key: string]: string | number | boolean | Concept | Concept[]
}

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
    [BP in keyof Base as Exclude<BP, "conceptId">]: Base[BP]
}

type ConceptWithOutId<T extends Concept> = {
    [BP in keyof T as Exclude<BP, "conceptId">]: T[BP]
}

export declare function castConcept<TargetConcept extends Concept, X extends ConceptWithOutId<TargetConcept>>(node: X): TargetConcept

type ReferenceValues<T extends Reference> = {
    [R in keyof T]: Ref<T[R]>
}

export function makeNode<ID extends string, T extends MakeConcept<ID, O, R>, O extends Own, R extends Reference>(conceptId: ID, owned: O, refs: ReferenceValues<R>): T {
    return {
        ...owned,
        ...refs,
        conceptId,
        ref() {
            return new RefImpl<T>(this)
        }
    } as unknown as T
}

interface Ref<T extends Concept> {
    value: Promise<T>

    set(value: T)
}

class RefImpl<T extends Concept> implements Ref<T> {
    _value: T

    constructor(value: T) {
        this._value = value
    }
    value: Promise<T> = new Promise(resolve => resolve(this._value))

    set(value: T) {
        this._value = value
    }
}


