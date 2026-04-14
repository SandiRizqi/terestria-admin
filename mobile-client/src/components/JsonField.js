import React from 'react';

const JsonField = ({ record, source }) => {
    const value = record && record[source];
    if (value === null || value === undefined) return null;

    return (
        <pre style={{
            background: '#f6faf6',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #e0ece0',
            overflow: 'auto',
            maxHeight: 400,
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            color: '#1a2e1a',
        }}>
            {JSON.stringify(value, null, 2)}
        </pre>
    );
};

JsonField.defaultProps = { addLabel: true };

export default JsonField;
