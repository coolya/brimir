

export class Concept {
    conceptId: string
    container: AstContainer
    nodeId: string
    superConcept: Concept | undefined
}


export  type Own = {
    [key: string]: string | number | boolean | Concept | Concept[] | undefined
}

type ConceptId = "conceptId"

export type Reference = {
    [key: string]: Concept
}

type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

export type MakeConcept<id extends string, Owned extends Own, Refs extends Reference> =
    {
        get<Key extends string & keyof Owned>
        (name: `${Key}`): Owned[Key];
        set<Key extends string & keyof Pick<Owned, WritableKeys<Owned>>>
        (name: `${Key}`, value: Owned[Key]): void;
        get<Key extends string & keyof Refs>
        (name: `${Key}`): Ref<Refs[Key]>;
        on<Key extends string & keyof Pick<Owned, WritableKeys<Owned>>>
        (name: `${Key}Changed`, callback: (source: MakeConcept<id, Owned, Refs>, newValue: Owned[Key]) => void): void;
        on<Key extends string & keyof Refs>
        (name: `${Key}Changed`, callback: (source: MakeConcept<id, Owned, Refs>, newValue: Refs[Key]) => void): void;
    }
    & Concept
    & {
    conceptId: id
    ref(): Ref<MakeConcept<id, Owned, Refs> & Concept>
} & {
    [BP in keyof Owned]: Owned[BP]
} & {
    [BP in keyof Refs]: Ref<Refs[BP]>
}

export type MakeConceptExtension<Base extends Concept, id extends string, Owned extends Own, Refs extends Reference> =
    MakeConcept<id, Owned, Refs> & {
    [BP in keyof Base as Exclude<BP, ConceptId>]: Base[BP]
} & { superConcept: Base }

type ConceptWithOutId<T extends Concept> = {
    [BP in keyof T as Exclude<BP, ConceptId>]: T[BP]
}

export declare function castConcept<TargetConcept extends Concept, X extends ConceptWithOutId<TargetConcept>>(node: X): TargetConcept

export interface Ref<T extends Concept> {
    value(): Promise<T>
    set(value: T): void
}

export interface AstContainer {
    getNode(id: string): Promise<Concept>
    addNode(node: Concept): void
}


