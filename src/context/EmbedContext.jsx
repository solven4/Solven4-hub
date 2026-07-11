import React, { createContext, useContext, useState } from 'react';

const EmbedContext = createContext(null);

export function EmbedProvider({ children }) {
  const [activeDoor, setActiveDoor] = useState(null);
  const openDoor = (door) => setActiveDoor(door);
  const closeDoor = () => setActiveDoor(null);
  return (
    <EmbedContext.Provider value={{ activeDoor, openDoor, closeDoor }}>
      {children}
    </EmbedContext.Provider>
  );
}

export const useEmbed = () => useContext(EmbedContext);
