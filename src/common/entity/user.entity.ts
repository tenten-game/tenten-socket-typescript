/**
 * User entity with abbreviated property names for performance optimization.
 * 
 * @property i - User ID (unique identifier)
 * @property a - Arcade Icon ID 
 * @property f - Family Icon ID
 * @property t - Team ID (0 or 1 for team games)
 * @property n - Nickname (display name)
 * 
 * Note: 축약된 속성명은 네트워크 전송 최적화를 위해 사용됩니다.
 */
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

// Type-safe interface for better IntelliSense
export interface IUser {
    id: number;          // i
    arcadeIcon: number;  // a
    familyIcon: number;  // f
    teamId: number;      // t
    nickname: string;    // n
}