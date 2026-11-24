import { STAGE } from "../../secrect";

export const customConsoleLogForDev = (message: string) => STAGE !== "production" && console.log(message);
