import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const COLORS = {
    point: '#e53935',
    line: '#1565c0',
    polygon: '#2e7d32',
};

const GeometryDistributionChart = ({ data = [] }) => {
    const chartData = data.map((item) => ({
        name: (item.project__geometry_type || 'unknown').charAt(0).toUpperCase()
            + (item.project__geometry_type || 'unknown').slice(1),
        value: item.count,
        type: item.project__geometry_type,
    }));

    return (
        <Card style={{ borderRadius: 12, border: '1px solid #e0ece0' }}>
            <CardContent>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#1b5e20', marginBottom: 16 }}>
                    Geometry Type Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {chartData.map((entry, idx) => (
                                <Cell key={idx} fill={COLORS[entry.type] || '#9e9e9e'} />
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

export default GeometryDistributionChart;
