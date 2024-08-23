import React from 'react';
import OpenAI from 'openai';
import { classNames } from '../utils/classNames';


interface IChatMessageProps {
    message: OpenAI.Chat.ChatCompletionMessageParam
    messageIndex: number
}

const ChatMessage: React.FC<IChatMessageProps> = ({message, messageIndex}): JSX.Element | null => {

    if (message.role !== 'user' && message.role !== 'assistant') {
        // Filter out other types of messages, like system messages
        return null
    }

    // TODO: We can't assume this is a string. We need to handle the other
    // return options
    const messageContentParts = (message.content as string).split('```')


    return (
        <div className={classNames(
            "message", 
            {"message-user" : message.role === 'user'},
            {'message-assistant' : message.role === 'assistant'}
        )}
        >
            {messageContentParts.map(messagePart => {
                if (messagePart.startsWith('python')) {
                    console.log("PYTHON:", messagePart)
                    return <code>{messagePart.split('python')[1]}</code>
                } else {
                    return (
                        <p>{messagePart}</p>
                    )
                }
            })}
        </div>
    )
}

export default ChatMessage