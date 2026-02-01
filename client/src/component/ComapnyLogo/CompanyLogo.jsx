import React from 'react'
import Logo from '../../assets/Logo.png'

const CompanyLogo = () => {
    return (
        <img
            src={Logo}
            alt="Lanka-Capital"
            className="cursor-pointer w-[clamp(4rem,8vw,6rem)] object-contain"
        // onClick={handleNavigate}
        />
    )
}

export default CompanyLogo