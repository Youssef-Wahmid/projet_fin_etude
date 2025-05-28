// import { useEffect } from "react";
// import { useNavigate } from "react-router";
// const navigate = useNavigate();


export const BASE_URL = 'http://127.0.0.1:8000/api';

export const getHeaders = (token) => {
    return {
        headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
    };
};


