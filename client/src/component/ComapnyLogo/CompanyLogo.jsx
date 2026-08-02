import React from 'react'
import Logo from '../../assets/Logo.png'
import { useNavigate } from 'react-router-dom'

const CompanyLogo = ({ className = "" }) => {

    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/");
    }

    return (
        <img
            src={Logo}
            alt="Lanka-Capital"
            onClick={handleNavigate}
            className={`cursor-pointer w-full h-full object-contain ${className}`}
        />
    )
}

export default CompanyLogo