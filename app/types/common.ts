export type KeyNumberMap = {
    [key: string]: number;
}

export type WithId = {
    id:string;
}

export type MaybeUserError = {
    userErrors?: ({
        field: string[];
        message: string;
    } | any)[]
} | null | undefined