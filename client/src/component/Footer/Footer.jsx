import React from 'react'

import CompanyLogo from '../ComapnyLogo/CompanyLogo';
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 text-black shadow-2xl flex flex-col items-center justify-center gap-4 py-6">
            <CompanyLogo />
            <div className=' md:text-2xl'>
                N K R S Lanka Capital Pvt. Ltd
            </div>

            <hr className="w-3/4 border border-black" />

            <div>
                <span className='font-bold'> &copy;  {currentYear} </span> | All rights reserved
            </div>
        </footer>
    );
};

export default Footer