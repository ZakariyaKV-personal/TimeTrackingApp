import React from 'react';

const InputField = ({ label, type, value, className, onChange, placeholder }) => {
    return (
        <div className="row input-row">
            <label>{label}</label>
            <input 
                className={className}
                type={type} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
                required 
            />
        </div>
    );
};

export default InputField;
