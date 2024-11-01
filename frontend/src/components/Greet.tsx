import React, { useState } from "react";

export const Greet: React.FC = () => {
    const [name, setName] = useState("");
    const [greeting, setGreeting] = useState("");

    const handleGreet = () => {
        if (google && google.script && google.script.run) {
            google.script.run
                .withSuccessHandler((msg: string) => {
                    setGreeting(msg);
                })
                .withFailureHandler((error) => {
                    console.error("Error:", error);
                })
                .getGreeting(name);
        } else {
            console.error("google.script.run is not available.");
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Google Sheets Add-on</h1>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: "8px", fontSize: "16px", width: "200px" }}
            />
            <button
                onClick={handleGreet}
                style={{ padding: "8px 16px", marginLeft: "10px", fontSize: "16px" }}
            >
                Greet
            </button>
            {greeting && <p style={{ marginTop: "20px" }}>{greeting}</p>}
        </div>
    );
};
