import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const ProjectBarChart = ({ data = [] }) => {
    const chartData = data.map((item) => ({
        name: (item.project__name || 'Unknown').length > 15
            ? (item.project__name || 'Unknown').slice(0, 15) + '...'
            : item.project__name || 'Unknown',
        count: item.count,
    }));

    return (
        <Card style={{ borderRadius: 12, border: '1px solid #e0ece0' }}>
            <CardContent>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#1b5e20', marginBottom: 16 }}>
                    Top Projects by Data Count
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0ece0" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#6b8f6b' }} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#6b8f6b' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0ece0' }} />
                        <Bar dataKey="count" fill="#4caf50" radius={[0, 4, 4, 0]} name="GeoData" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default ProjectBarChart;
