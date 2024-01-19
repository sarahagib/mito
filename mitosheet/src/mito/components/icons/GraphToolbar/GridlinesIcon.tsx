// Copyright (c) Mito

import React from 'react';

const GridlinesIcon = (props: { orientation?: 'vertical' | 'horizontal' | 'none' }): JSX.Element => {
    return (
        <svg width="19" height="17" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            {props.orientation !== undefined && <path d="M0.5 0V21H27" stroke="black"/>}
            {(props.orientation === undefined || props.orientation === 'horizontal') && <path d="M0 21H5.60784H12.2353H19.1176H26M0 14.9884H26M0 8.01163H26M0 1.5H5.60784H12.2353H19.1176H26" stroke="#9D6CFF"/>}
            {(props.orientation === undefined || props.orientation === 'vertical') && <path d="M5.60742 0.5L5.60742 20M12.2349 0.5L12.2349 20M19.1172 0.5L19.1172 20" stroke="#9D6CFF"/>}
            <rect x="12.5" y="10" width="5" height="10" fill="#F5F5F5" stroke="#C2C2C2"/>
            <rect x="7.5" y="5" width="5" height="15" fill="white" stroke="#767180"/>
        </svg>
    )
}

export default GridlinesIcon;