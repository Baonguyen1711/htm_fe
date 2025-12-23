import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"

interface AnswerCountChartProps {
    answers: string[];
    // e.g. [ { playerId: "1", choice: "A" }, { playerId: "2", choice: "B" } ]
    choices: string[];
}

const AnswerCountChart: React.FC<AnswerCountChartProps> = ({ answers, choices }) => {
    // Count how many picked each choice
    const counts = {
        A: answers.filter(a => a === "A").length,
        B: answers.filter(a => a === "B").length,
        C: answers.filter(a => a === "C").length,
        D: answers.filter(a => a === "D").length,
    };

    const chartData = Object.entries(counts).map(([choice, count]) => ({
        choice,
        count,
    }));


    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="choice" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default AnswerCountChart;
