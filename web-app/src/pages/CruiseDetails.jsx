import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const CruiseDetails = () => {
    const { id } = useParams();
    return <Navigate to={`/services/${id}`} replace />;
};

export default CruiseDetails;
