import { STAGE } from "../../secrect";

export const customConsoleLogForDev = (message: string | unknown) => STAGE !== "prod" && console.log(message);
