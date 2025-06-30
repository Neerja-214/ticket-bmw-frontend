// Footer.js
import React from 'react';

const Footer = () => {
    return (
        // <footer className="bg-gray-800 text-white pb-4 mt-auto">
        //   <div className="container mx-auto">
        //     <div className="flex justify-center">
        //       <p>Copyright &copy; {new Date().getFullYear()} CPCB. All rights reserved.</p>
        //     </div>
        //   </div>
        // </footer>
        <footer className="bg-transparent text-gray-800  mt-auto">
            <div className="container mx-auto">
                <div className="flex justify-center">
                    <p>Copyright &copy; {new Date().getFullYear()} CPCB. All rights reserved.</p>
                </div>
            </div>
        </footer>

    );
};

export default Footer;
