import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const DataTrendsChart = ({ data = [] }) => {
    const chartData = data.map((item) => ({
        date: item.date ? item.date.slice(5) : '',  // MM-DD
        count: item.count,
    }));

    return (
        <Card style={{ borderRadius: 12, border: '1px solid #e0ece0' }}>
            <CardContent>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#1b5e20', marginBottom: 16 }}>
                    Data Collection Trend (30 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0ece0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b8f6b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b8f6b' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e0ece0' }}
                            labelStyle={{ fontWeight: 700, color: '#1b5e20' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#388e3c"
                            strokeWidth={2}
                            dot={{ fill: '#388e3c', r: 3 }}
                            activeDot={{ r: 5, fill: '#2e7d32' }}
                            name="GeoData"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default DataTrendsChart;
