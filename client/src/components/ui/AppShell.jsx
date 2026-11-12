import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Training Plan", path: "/plan" },
    { title: "AI Coach" },
    { title: "Settings" }
];

const logout = async () => {
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });
    } finally {
        window.location.href = "/";
    }
};

export function AppShell({ current, tone = "paper", children, actions }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const goTo = (path) => {
        setMenuOpen(false);
        if (path) navigate(path);
    };

    const navItems = (className) =>
        NAV.map(({ title, path }) =>
            path ? (
                <button
                    key={title}
                    type="button"
                    className={className}
                    aria-current={path === current ? "page" : undefined}
                    onClick={() => goTo(path)}
                >
                    {title}
                </button>
            ) : (
                <button
                    key={title}
                    type="button"
                    className={`${className} ${className}--off`}
                    disabled
                    title="Not available yet"
                >
                    {title}
                </button>
            )
        );

    return (
        <div className={`app app--${tone}`} data-tone={tone}>
            <header className="app-bar">
                <div className="app-container app-bar__inner">
                    <button
                        type="button"
                        className="brand"
                        onClick={() => goTo("/dashboard")}
                        aria-label="Endurio dashboard"
                    >
                        <span className="brand__mark" aria-hidden="true">E</span>
                        <span className="brand__word">Endurio</span>
                    </button>

                    <nav className="app-nav" aria-label="Primary navigation">
                        {navItems("app-nav__link")}
                    </nav>

                    <div className="app-bar__account">
                        {actions}
                        <button type="button" className="bar-link" onClick={logout}>
                            Log out
                        </button>
                        <button
                            type="button"
                            className="bar-menu"
                            onClick={() => setMenuOpen((value) => !value)}
                            aria-expanded={menuOpen}
                            aria-controls="app-menu"
                            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                        >
                            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="app-menu" id="app-menu">
                        <div className="app-container">
                            {navItems("app-menu__link")}
                            <button type="button" className="app-menu__link" onClick={logout}>
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {children}
        </div>
    );
}
