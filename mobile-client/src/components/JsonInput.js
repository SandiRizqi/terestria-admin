import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { useInput } from 'react-admin';

const JsonInput = (props) => {
    const { source, label, ...rest } = props;
    const {
        input: { onChange, value },
        meta: { touched, error },
    } = useInput({ source, ...rest });

    const [text, setText] = useState(
        value ? JSON.stringify(value, null, 2) : ''
    );
    const [parseError, setParseError] = useState(null);

    const handleChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        try {
            const parsed = JSON.parse(newText);
            onChange(parsed);
            setParseError(null);
        } catch (err) {
            setParseError('Invalid JSON');
        }
    };

    return (
        <TextField
            label={label || source}
            multiline
            rows={8}
            variant="outlined"
            fullWidth
            value={text}
            onChange={handleChange}
            error={!!parseError || (touched && !!error)}
            helperText={parseError || (touched && error)}
            style={{ marginBottom: 16 }}
        />
    );
};

export default JsonInput;
