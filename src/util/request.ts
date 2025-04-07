import axios from "axios";

export async function requestToSpringServer(masterId: number, userId: number): Promise<void> {
  const url: string = 'https://lb5.tenten.games/v1/co-players';
  await axios.post(url, {
    masterId: masterId,
    userId: userId,
    apiKey: 'WEPNVZ20prn!@#'
  });
}
