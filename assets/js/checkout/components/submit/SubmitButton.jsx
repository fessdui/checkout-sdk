import React from 'react';

export default function SubmitButton({isLoading, label}) {
    return (
        <button
            type="submit"
            disabled={ isLoading }
            className='button button--primary'>
            { label }
        </button>
    );
}
