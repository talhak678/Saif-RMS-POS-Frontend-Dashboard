import { NavItem } from '@/lib/data/sidebar-items';
import { createContext, useContext, useState } from 'react';
import { GetModules } from './protected-route';

interface ModulesContextType {
    Modules: NavItem[];
    modulesLoaded: boolean;
    setModulesLoaded: (value: boolean) => void;
    setModules: (value: NavItem[]) => void;
}

const ModulesContext = createContext<ModulesContextType>({
    Modules: [],
    modulesLoaded: false,
    setModulesLoaded: () => { },
    setModules: () => { },
});

export const ModulesProvider = ({ children }: { children: any }) => {
    const [Modules, setModules] = useState<NavItem[]>([]);
    const [modulesLoaded, setModulesLoaded] = useState(false);

    return (
        <>
            <GetModules fetched={(m) => {
                setModules(m)
                setModulesLoaded(true)
            }} />
            <ModulesContext.Provider value={{ Modules, modulesLoaded, setModulesLoaded, setModules }}>
                {children}
            </ModulesContext.Provider>
        </>
    );
};

export const useModules = () => useContext(ModulesContext);

