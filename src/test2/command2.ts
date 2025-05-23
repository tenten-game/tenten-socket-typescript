export const TARGET = 'https://app2.tenten.games:9443';
export const ROOM_NUMBER = '49634821';
export const TEAM_1_ID = 834;
export const TEAM_2_ID = 835;
export const TOTAL_CLIENTS = 400 / 5; // 원하는 동시 접속자 수
const TOTAL_TIME = 2 * 60 * 1000; // N분
const REAL_TIME_SCORE_PER_SECOND_MIN = 1; // 0 ~ N 
const REAL_TIME_SCORE_PER_SECOND_MAX = 4; // 0 ~ N 
const FINAL_SCORE_MIN = 30; // 0 ~ 80
const FINAL_SCORE_MAX = 60; // 0 ~ 80

export function ENTER_ROOM_REQUEST(idx: number): string {
	return JSON.stringify({
		"user": {
			"i": idx, // user id
			"a": Math.floor(Math.random() * (46 - 14 + 1)) + 14, // avatar id
			"f": Math.floor(Math.random() * (46 - 14 + 1)) + 14, // avatar id
			"t": Math.random() < 0.5 ? TEAM_1_ID : TEAM_2_ID,
			"n": generateNickname() // nickname
		},
		"roomNumber": ROOM_NUMBER,
	});
}

function generateNickname(): string {
	const prefix: string[] = [
		"함께하는", "춤추는", "열정적인", "게이머", "부지런한", "행복한", "행운의"
	];
	const suffix: string[] = [
		"텐텐", "긴도리", "민도리", "댕그리", "주리", "곰토리", "실크", "밀크", "다크",
	];
	const randomNumber = Math.floor(Math.random() * 99) + 1;
	const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
	const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)];
	return `${randomPrefix} ${randomSuffix} ${randomNumber}`;
}

export function delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

export function randomRealTimeScore(): number {
	return Math.floor(Math.random() * (REAL_TIME_SCORE_PER_SECOND_MAX - REAL_TIME_SCORE_PER_SECOND_MIN + 1)) + REAL_TIME_SCORE_PER_SECOND_MIN;
}

export function randomFinishScore(): number {
	return Math.floor(Math.random() * (FINAL_SCORE_MAX - FINAL_SCORE_MIN + 1)) + FINAL_SCORE_MIN;
}

export function getRandomTime(): number {
	return Math.floor(Math.random() * TOTAL_TIME);
}