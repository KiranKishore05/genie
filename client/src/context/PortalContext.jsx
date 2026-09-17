import { createContext, useCallback, useEffect, useState } from "react";

const PortalContext = createContext();

export default PortalContext;

export function PortalProvider({ children }) {
    const [showAddress, setShowAddress] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(() => {
        try {
            const savedLocation = localStorage.getItem("genieSelectedLocation");
            return savedLocation ? JSON.parse(savedLocation) : null;
        } catch (error) {
            return null;
        }
    });

    useEffect(() => {
        if (selectedLocation) {
            localStorage.setItem(
                "genieSelectedLocation",
                JSON.stringify(selectedLocation)
            );
        } else {
            localStorage.removeItem("genieSelectedLocation");
        }
    }, [selectedLocation]);

    const openAddress = () => setShowAddress(true);
    const closeAddress = useCallback(() => setShowAddress(false), []);

    const openLogin = () => setShowLogin(true);
    const closeLogin = useCallback(() => setShowLogin(false), []);

    const openRegister = () => setShowRegister(true);
    const closeRegister = useCallback(() => setShowRegister(false), []);

    return (
        <PortalContext.Provider
            value={{
                showAddress,
                openAddress,
                closeAddress,
                showLogin,
                openLogin,
                closeLogin,
                showRegister,
                openRegister,
                closeRegister,
                selectedLocation,
                setSelectedLocation,
            }}
        >
            {children}
        </PortalContext.Provider>
    );
}
