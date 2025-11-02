import { axiosClient } from "../composition-root";

async function test() {
	const result = await axiosClient.post(
		"/trips",
		{
			pickupLat: "1",
			pickupLng: "1",
			dropoffLat: "1",
			dropoffLng: "1",
		},
		{
			headers: {
				"X-User-Id": "1",
			},
		}
	);
	console.log(result.data);
}

test();
