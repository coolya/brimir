type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
	[P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

export type Props = {
	[key: string]: string | number | boolean | undefined | AstNode<any, any> | Array<AstNode<any, any>> | Ref<AstNode<any, any>>
}


export type Concept<Id extends string, P extends Props> = {
	conceptId: Id
	superConcept: Concept<string, any> | undefined
	isSubConceptOf<OtherId extends string, OtherProps extends P>(c: Concept<OtherId, OtherProps>): boolean
	extendWith<ExId extends string, ExProps extends Props>(id: ExId): Concept<ExId & Id, P & ExProps>
	nodeType: AstNode<Concept<Id, P>, P>
	referenceType: Ref<AstNode<Concept<Id, P>, P>>
}


export type AstNode<C extends Concept<string, P>, P extends Props> = {
	get<Key extends string & keyof P>(name: `${Key}`): P[Key]
	set<Key extends string & keyof Pick<P, WritableKeys<P>>>(name: `${Key}`, value: P[Key]): void 
	on<Key extends string & keyof Pick<P, WritableKeys<P>>>(name: `${Key}Changed`, callback: (source: AstNode<C, P>, newValue: P[Key], oldValue: P[Key]) => void): void 
	concept: C
	ref(): Ref<AstNode<C, P>>
	nodeId: string
}

export interface Ref<T extends AstNode<any, any>> {
	value(): Promise<T>
	set(value: T): void
}

export interface AstContainer {
	getNode(id: string): Promise<AstNode<any, any>>
	addNode(node: AstNode<any, any>): void
}


