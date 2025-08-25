import { app } from "./app"
import { env } from "@/config/env"

app.listen(env.PORT, () => console.log("Server in running port " + env.PORT))