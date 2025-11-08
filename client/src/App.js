import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const FullPageSpinner = () => (
    <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
    </div>
);

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CrmPage = lazy(() => import('./pages/CrmPage'));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

const ROLES = {
    ADMIN: 'admin',
    SALES: 'sales_staff',
    SERVICE: 'service_advisor',
    INVENTORY: 'inventory_manager',
};

const PublicLayout = ({ children }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return <FullPageSpinner />;
    }
    
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<FullPageSpinner />}>
                <Routes>
                    <Route 
                        path="/login" 
                        element={
                            <PublicLayout>
                                <LoginPage />
                            </PublicLayout>
                        } 
                    />
                    
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        
                        <Route 
                            element={
                                <ProtectedRoute 
                                    allowedRoles={[ROLES.ADMIN, ROLES.SALES]} 
                                />
                            }
                        >
                            <Route path="/crm" element={<CrmPage />} />
                        </Route>

                    </Route>

                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;