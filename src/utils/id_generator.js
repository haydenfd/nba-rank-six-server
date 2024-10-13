import { v4 as uuidv4 } from 'uuid';

const generateUserId = () => {
    const dateString = Date.now().toString();
    const randomPrefix = Math.floor(Math.random() * 100) + 1;

    return `${randomPrefix}${dateString}`;
};

const generateSessionId = () => uuidv4().replace(/-/g, '');

export {
    generateUserId,
    generateSessionId,
};
