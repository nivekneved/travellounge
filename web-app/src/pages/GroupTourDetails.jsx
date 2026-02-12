import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const GroupTourDetails = () => {
    const { id } = useParams();
    return <Navigate to={`/services/${id}`} replace />;
};

export default GroupTourDetails;
