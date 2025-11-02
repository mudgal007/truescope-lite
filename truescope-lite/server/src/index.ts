import "dotenv/config"
import {app} from './app'
import { connectDB } from "./db"
import { env } from "./env";

const port = Number(env.PORT) || 4000;

(async () =>{
    await connectDB();
    app.listen(port, ()=> console.log(`API is running ${port}`))
})();