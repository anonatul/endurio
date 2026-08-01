import { useAuth } from '../context/AuthContext';

function Dashboard() { 

    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });

            if (response.ok) {
                window.location.href = "/";
            } else {
                console.error("Logout failed - backend-side error");
            }

        } catch (error) {
            console.error("Network error during logout:", error);
        }
    }
    return (
        <div>
            <h2>Welcome {user.name} to your Dashboard</h2>
            <p>Here you can view your training progress and stats.</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;