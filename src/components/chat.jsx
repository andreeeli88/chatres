import React, { useState } from "react";
import { Send } from "lucide-react";
import OpenAI from "openai";
import key from "./key.json";
import "./Chatbot.css"; // Importamos el archivo de estilos

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
            // Crear hilo y mensaje en OpenAI
            const thread = await openai.beta.threads.create();
            await openai.beta.threads.messages.create(thread.id, { role: "user", content: input });
            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: "asst_tcokIiZ4KMTuRqKAWrh1HQb9"
            });

            // Esperar a que la ejecución termine
            let runStatus;
            do {
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            } while (runStatus.status === "in_progress");

            // Obtener respuesta del asistente
            const messagesData = await openai.beta.threads.messages.list(thread.id);
            const responseText = messagesData.data[0]?.content[0]?.text?.value || "No tengo una respuesta.";

            // Iniciar simulación de streaming
            let streamedResponse = "";
            setMessages((prev) => [...prev, { text: "", sender: "bot", id: thread.id }]);

            for (let i = 0; i < responseText.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 50)); // Simular retraso
                streamedResponse += responseText[i];

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === thread.id ? { ...msg, text: streamedResponse } : msg
                    )
                );
            }

        } catch (error) {
            console.error("Error con OpenAI:", error);
            setMessages((prev) => [...prev, { text: "Hubo un error en la solicitud.", sender: "bot" }]);
        }

        setLoading(false);
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === "user" ? "message-user" : "message-bot"}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chatbot-input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="chatbot-input"
                    disabled={loading}
                />
                <button onClick={handleSend} className="chatbot-button" disabled={loading}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
