import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const ActivityDetails = () => {
    const { id } = useParams();
    return <Navigate to={`/services/${id}`} replace />;
};

export default ActivityDetails;
