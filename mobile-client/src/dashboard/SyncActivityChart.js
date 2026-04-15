import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const SyncActivityChart = ({ data = [] }) => {
    // Group by date, pivot status into columns
    const dateMap = {};
    data.forEach((item) => {
        const date = item.date ? item.date.slice(5) : '';
        if (!dateMap[date]) dateMap[date] = { date, success: 0, failed: 0, partial: 0 };
        dateMap[date][item.status] = (dateMap[date][item.status] || 0) + item.count;
    });
    const chartData = Object.values(dateMap);

    return (
        <Card style={{ borderRadius: 12, border: '1px solid #e0ece0' }}>
            <CardContent>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#1b5e20', marginBottom: 16 }}>
                    Sync Activity (30 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0ece0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b8f6b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b8f6b' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0ece0' }} />
                        <Legend />
                        <Bar dataKey="success" stackId="a" fill="#4caf50" name="Success" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="failed" stackId="a" fill="#e53935" name="Failed" />
                        <Bar dataKey="partial" stackId="a" fill="#ff9800" name="Partial" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default SyncActivityChart;
