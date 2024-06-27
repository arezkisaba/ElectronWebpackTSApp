import React, { useState, useEffect } from 'react';

interface ModalComponentProps {
    Loading: boolean;
}

const HomeComponent: React.FC<ModalComponentProps> = ({ Loading }) => {

    return (
        <div>
            <h2>Hello from React!</h2>
        </div>
    );
};

export default HomeComponent;
