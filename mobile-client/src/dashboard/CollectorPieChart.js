import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const COLORS = ['#2e7d32', '#388e3c', '#43a047', '#4caf50', '#66bb6a', '#81c784', '#a5d6a7',
    '#1565c0', '#1976d2', '#42a5f5', '#e65100', '#f57c00', '#ff9800', '#6a1b9a', '#9c27b0'];

const CollectorPieChart = ({ data = [] }) => {
    const chartData = data.map((item) => ({
        name: item.collected_by__username || 'Unknown',
        value: item.count,
    }));

    return (
        <Card style={{ borderRadius: 12, border: '1px solid #e0ece0' }}>
            <CardContent>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#1b5e20', marginBottom: 16 }}>
                    Data by Collector
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0ece0' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default CollectorPieChart;
