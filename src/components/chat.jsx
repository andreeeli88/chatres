import React, { useState } from "react";
import { Send } from "lucide-react";
import OpenAI from "openai";
import key from "./key.json";


const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "¡Hola! ¿En qué puedo ayudarte?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const openai = new OpenAI({ apiKey: key.OPENAI_KEY, dangerouslyAllowBrowser: true });

    const handleSend = async () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, { text: input, sender: "user" }]);
        setInput("");
        setLoading(true);
        try {
            const thread = await openai.beta.threads.create();
            await openai.beta.threads.messages.create(thread.id, {
                role: "user",
                content: input
            });
            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: "asst_tcokIiZ4KMTuRqKAWrh1HQb9"
            });
            // Esperar a que la ejecución termine
            let runStatus;
            do {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            } while (runStatus.status === "in_progress");
            const messages = await openai.beta.threads.messages.list(thread.id);
            const responseText = messages.data[0]?.content[0]?.text?.value || "No tengo una respuesta.";
            setMessages((prev) => [...prev, { text: responseText, sender: "bot" }]);
        } catch (error) {
            console.error("Error con OpenAI:", error);
            setMessages((prev) => [...prev, { text: "Hubo un error en la solicitud.", sender: "bot" }]);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: "400px", margin: "20px auto", padding: "10px", border: "1px solid #ddd", borderRadius: "10px" }}>
            <div style={{ height: "300px", overflowY: "auto", padding: "10px", borderBottom: "1px solid #ddd" }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ padding: "5px", backgroundColor: msg.sender === "user" ? "#cce5ff" : "#e2e2e2", textAlign: msg.sender === "user" ? "right" : "left", borderRadius: "10px", marginBottom: "5px" }}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", marginTop: "10px" }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    style={{ flexGrow: 1, padding: "5px" }}
                    disabled={loading}
                />
                <button onClick={handleSend} style={{ marginLeft: "5px", padding: "5px", cursor: "pointer" }} disabled={loading}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
