export class User {
    i: number; // USER ID
    a: number; // USER ARCADE ICON ID
    f: number; // USER FAMILY ICON ID
    t: number; // USER TEAM ID
    n: string; // USER NICKNAME

    constructor(i: number, a: number, f: number, t: number, n: string) {
        this.i = i;
        this.a = a;
        this.f = f;
        this.t = t;
        this.n = n;
    }
}