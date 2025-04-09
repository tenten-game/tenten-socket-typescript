import { RoomMode } from "../common/enums/enums";

export const TARGET = 'http://localhost:9442';
export const TOTAL_CLIENTS = 10000; // 원하는 동시 접속자 수
export const ROOM_NUMBER = '00000000';
export const TEAM_1_ID = 824;
export const TEAM_2_ID = 825;

////////////////////////////////////////////////////////////////////////////////////////////////
export const CREATE_ROOM_EMIT = 'event.room.create';
export const CREATE_ROOM_ON = 'event.room.created';
export const CREATE_ROOM_VALID_KEY = ROOM_NUMBER + '_L_' + CREATE_ROOM_ON;

export const CREATE_ROOM_REQUEST = JSON.stringify({
	"roomNumber": ROOM_NUMBER,
	"event": {
		"code": "HE0000094",
		"displayName": "CASS",
        "hostMainImageUrl": "https://image.tenten.games/image-server/a.png",
		"id": 94,
		"mode": "TEAM",
		"participantMainImageUrl": "https://image.tenten.games/cass_width_logo.png",
		"type": "HOST",
		"eventTeams": [
			{
				"color": "#FF0000",
				"displayName": "RED",
				"hidden": false,
				"hostMainImageUrl": "https://image.tenten.games/image-server/a.png",
				"id": TEAM_1_ID,
				"name": "",
				"order": 1,
				"participantMainImageUrl": "https://image.tenten.games/cass_width_logo.png"
			},
			{
				"color": "#0029FF",
				"displayName": "BLUE",
				"hidden": false,
				"hostMainImageUrl": "https://image.tenten.games/image-server/a.png",
				"id": TEAM_2_ID,
				"name": "",
				"order": 2,
				"participantMainImageUrl": "https://image.tenten.games/cass_width_logo.png"
			}
		]
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////
export const ENTER_ROOM_EMIT = 'event.room.enter';
export const ENTER_ROOM_ON = 'event.room.entered';
export const ENTER_ROOM_VALID_KEY = ROOM_NUMBER + '_L_' + ENTER_ROOM_ON;

export function ENTER_ROOM_REQUEST(idx: number): string {
	return JSON.stringify({
		"user": {
			"i": idx, // user id
			"a": 0, // arcade icon id
			"f": 0, // family icon id
			"t": Math.random() < 0.5 ? TEAM_1_ID : TEAM_2_ID,
			"n": "NICKNAME_"+idx // nickname
		},
		"roomNumber": ROOM_NUMBER,
	});
}
////////////////////////////////////////////////////////////////////////////////////////////////


export const HOST_ROOM_CHANGE_MODE_EMIT = 'event.room.changeMode';
export const HOST_ROOM_CHANGE_MODE_ON = 'event.room.changedMode';
export const HOST_ROOM_CHANGE_MODE_VALID_KEY = ROOM_NUMBER + '_L_' + HOST_ROOM_CHANGE_MODE_ON;
export function HOST_ROOM_CHANGE_MODE_REQUEST(mode: RoomMode): string {
	return JSON.stringify({
		"mode": mode
	});
}