import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    InputAdornment, 
    Box,
    IconButton 
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

const SearchBar = ({
    value,
    onChange,
    placeholder = "Search...",
    fullWidth = true,
    clearable = true,
    debounceDelay = 300, // Default: 300ms delay
    style = {},
    ...props
}) => {
    const [inputValue, setInputValue] = useState(value);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Debounce effect: Triggers `onChange` only after `debounceDelay` ms of inactivity
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            onChange({ target: { value: inputValue } });
        }, debounceDelay);

        return () => clearTimeout(debounceTimer); // Cleanup on unmount
    }, [inputValue, debounceDelay]);

    const handleClear = () => {
        setInputValue(''); // Clears input and triggers debounced onChange
    };

    return (
        <Box sx={{ position: 'relative', ...style }}>
            <TextField
                variant="outlined"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                    endAdornment: clearable && inputValue && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClear}
                                size="small"
                                edge="end"
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                    style: { 
                        height: '40px',
                        paddingRight: clearable ? '8px' : undefined 
                    },
                }}
                fullWidth={fullWidth}
                size="small"
                {...props}
            />
        </Box>
    );
};

export default SearchBar;