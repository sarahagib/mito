import React, { useState, useEffect } from 'react';
import { classNames } from '../../../utils/classNames';
import { ExpandedVariable } from './ChatInput';

interface ChatDropdownProps {
    options: ExpandedVariable[];
    onSelect: (variableName: string, parentDf?: string) => void;
    filterText: string;
    maxDropdownItems?: number;
    position?: 'above' | 'below';
}

const ChatDropdown: React.FC<ChatDropdownProps> = ({
    options,
    onSelect,
    filterText,
    maxDropdownItems = 10,
    position = 'below'
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredOptions = options.filter((variable) =>
        variable.variable_name.toLowerCase().includes(filterText.toLowerCase()) &&
        variable.type !== "<class 'module'>"
    ).slice(0, maxDropdownItems);

    useEffect(() => {
        setSelectedIndex(0);
    }, [options, filterText]);

    const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowDown' || 'Down':
                event.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp' || 'Up':
                event.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter' || 'Return':
                event.preventDefault();
                if (filteredOptions[selectedIndex]) {
                    onSelect(filteredOptions[selectedIndex].variable_name, filteredOptions[selectedIndex].parent_df);
                }
                break;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filteredOptions, selectedIndex]);

    const getShortType = (type: string) => {
        return type.includes("DataFrame") ? "df"
            : type.includes("<class '") ? type.split("'")[1]
                : type;
    }

    return (
        <div className={`chat-dropdown ${position}`}>
            <ul className="chat-dropdown-list" >
                {filteredOptions.length === 0 && (
                    <li className="chat-dropdown-item">No variables found</li>
                )}

                {filteredOptions.map((option, index) => {
                    const uniqueKey = option.parent_df
                        ? `${option.parent_df}.${option.variable_name}`
                        : option.variable_name;

                    return (
                        <li
                            key={uniqueKey}
                            className={classNames("chat-dropdown-item", { selected: index === selectedIndex })}
                            onClick={() => onSelect(option.variable_name, option.parent_df)}
                        >
                            <span className="chat-dropdown-item-type"
                                style={{
                                    color: getShortType(option.type) === 'df' ? 'blue'
                                        : getShortType(option.type) === 'col' ? 'orange'
                                            : "green"
                                }}
                                title={getShortType(option.type)}
                            >
                                {getShortType(option.type)}
                            </span>
                            <span
                                className="chat-dropdown-item-name"
                                title={option.variable_name}
                                ref={(el) => {
                                    // Show full text on hover if the text is too long
                                    if (el) {
                                        el.title = el.scrollWidth > el.clientWidth ? option.variable_name : '';
                                    }
                                }}
                            >
                                {option.variable_name}
                            </span>
                            {option.parent_df && (
                                <span className="chat-dropdown-item-parent-df">
                                    {option.parent_df}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ChatDropdown; 