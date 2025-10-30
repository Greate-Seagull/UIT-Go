import app from "./src/app";

const PORT = 3000;

app.listen(PORT, (error: any) => {
	if (error) throw error;
	console.log(`Listening to http://localhost:${PORT}`);
});
