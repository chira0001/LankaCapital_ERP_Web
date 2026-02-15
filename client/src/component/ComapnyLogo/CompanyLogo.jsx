import React from 'react'
import Logo from '../../assets/Logo.png'
import { useNavigate } from 'react-router-dom'

const CompanyLogo = () => {

    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/");
    }


    return (
        <img
            src={Logo}
            alt="Lanka-Capital"
            className="cursor-pointer w-[clamp(4rem,8vw,6rem)] object-contain"
            onClick={handleNavigate}
        />
    )
}

export default CompanyLogo