import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    CalendarRange,
    LayoutDashboard,
    LogOut,
    Menu,
    MoreHorizontal,
    Settings,
    Sparkles,
    X
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const NAV = [
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "Training Plan", path: "/plan", icon: CalendarRange },
    { title: "AI Coach", icon: Sparkles },
    { title: "Settings", icon: Settings }
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

const initialsFor = (name) =>
    (name || "Runner")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

export function DashboardShell({ children }) {
    const [navOpen, setNavOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const location = useLocation();
    const { user } = useAuth();

    const userName = user?.name?.trim() || "Runner";
    const userEmail = user?.email || "Strava athlete";

    useEffect(() => {
        if (!navOpen) return undefined;

        const onKeyDown = (event) => {
            if (event.key === "Escape") setNavOpen(false);
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [navOpen]);

    useEffect(() => {
        if (!userMenuOpen) return undefined;

        const closeMenu = (event) => {
            if (!userMenuRef.current?.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") setUserMenuOpen(false);
        };

        document.addEventListener("mousedown", closeMenu);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", closeMenu);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [userMenuOpen]);

    const navItems = (className) =>
        NAV.map(({ title, path, icon: Icon }) =>
            path ? (
                <Link
                    key={title}
                    to={path}
                    className={className}
                    aria-current={location.pathname === path ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                >
                    <Icon aria-hidden="true" />
                    <span>{title}</span>
                </Link>
            ) : (
                <button
                    key={title}
                    type="button"
                    className={`${className} ${className}--off`}
                    disabled
                    title="Not available yet"
                >
                    <Icon aria-hidden="true" />
                    <span>{title}</span>
                </button>
            )
        );

    return (
        <div className="dw-app">
            <div className="dw-frame">
                <aside
                    id="dw-sidebar"
                    className={`dw-sidebar${navOpen ? " is-open" : ""}`}
                    aria-label="Dashboard navigation"
                >
                    <div className="dw-sidebar__top">
                        <Link to="/dashboard" className="dw-brand" onClick={() => setNavOpen(false)}>
                            <span className="dw-brand__mark" aria-hidden="true">E</span>
                            <span className="dw-brand__word">Endurio</span>
                        </Link>
                        <button
                            type="button"
                            className="dw-sidebar__close"
                            onClick={() => setNavOpen(false)}
                            aria-label="Close navigation"
                        >
                            <X aria-hidden="true" />
                        </button>
                    </div>

                    <nav className="dw-nav" aria-label="Primary navigation">
                        {navItems("dw-nav__link")}
                    </nav>

                    <div className="dw-sidebar__footer" ref={userMenuRef}>
                        <span className="dw-avatar" aria-hidden="true">{initialsFor(userName)}</span>
                        <div className="dw-user">
                            <p className="dw-user__name">{userName}</p>
                            <p className="dw-user__email">{userEmail}</p>
                        </div>
                        <button
                            type="button"
                            className="dw-user__menu-button"
                            onClick={() => setUserMenuOpen((value) => !value)}
                            aria-label="Account menu"
                            aria-haspopup="menu"
                            aria-expanded={userMenuOpen}
                        >
                            <MoreHorizontal aria-hidden="true" />
                        </button>

                        {userMenuOpen && (
                            <div className="dw-user-menu" role="menu">
                                <button type="button" role="menuitem" onClick={logout}>
                                    <LogOut aria-hidden="true" />
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {navOpen && (
                    <button
                        type="button"
                        className="dw-scrim"
                        onClick={() => setNavOpen(false)}
                        aria-label="Close navigation"
                    />
                )}

                <div className="dw-content">
                    <header className="dw-mobile-bar">
                        <Link to="/dashboard" className="dw-brand">
                            <span className="dw-brand__mark" aria-hidden="true">E</span>
                            <span className="dw-brand__word">Endurio</span>
                        </Link>
                        <button
                            type="button"
                            className="dw-mobile-bar__menu"
                            onClick={() => setNavOpen(true)}
                            aria-label="Open navigation"
                            aria-expanded={navOpen}
                            aria-controls="dw-sidebar"
                        >
                            <Menu aria-hidden="true" />
                        </button>
                    </header>

                    <main className="dw-main">{children}</main>
                </div>
            </div>
        </div>
    );
}
