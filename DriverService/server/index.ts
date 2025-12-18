import app from "./src/app";
import { requestQueue } from "./src/infrastructure/request-queue/local.request-queue";
import { workerLoop } from "./src/infrastructure/request-queue/worker";

const PORT = 3000;

workerLoop(requestQueue);

app.listen(PORT, (error: any) => {
	if (error) throw error;
	console.log(`Version 1.0.1`);
	console.log(`Listening to http://localhost:${PORT}`);
});
