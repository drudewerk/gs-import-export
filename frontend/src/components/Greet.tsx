import React, { useState } from "react";
import { Button } from "../framework/Button/Button";
import { ButtonType } from "../framework/Button/types";
import styled from "styled-components";

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
        <div style={{ padding: "20px" }}>
            <h1>Google Sheets Add-on</h1>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: "8px", width: "200px" }}
            />
            <GreetButton
                type={ButtonType.primary}
                onClick={handleGreet}
            >
                Greet
            </GreetButton>
            {greeting && <p style={{ marginTop: "20px" }}>{greeting}</p>}
        </div>
    );
};

const GreetButton = styled(Button)`
    margin-left: 10px;
`;
