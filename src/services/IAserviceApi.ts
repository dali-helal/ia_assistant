import axios from "axios";

const FLASK_URL: string = 'http://127.0.0.1:5000';

interface RequestBody {
    question: string;
    history: Array<Record<"user" | "bot", string>>;
}
interface ResponseBody {
    answer: string;
    model_used:string;
    success:boolean
    tokens_used:number
}
export const getAssistantResponse  =
    async (requestBody: RequestBody):
    Promise<ResponseBody | null> => {
    try {
        const response = await axios.post(`${FLASK_URL}/ai-assistant`, requestBody);
        return response.data;
    } catch (err) {
        console.error("Error in getAssistantResponse:", err);
        return null;
    }
};
