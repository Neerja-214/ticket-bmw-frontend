import React from "react";

const Header=()=>{
 return(
     <nav className="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
         <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
             <a className="navbar-brand brand-logo" href="/"><strong>Central Pollution Board</strong></a>
             <a className="navbar-brand brand-logo-mini  text-center" href="/" ><strong> &nbsp; &nbsp;XYZ COMPANY</strong></a>
         </div>
         <div className="navbar-menu-wrapper d-flex align-items-stretch">

        
             <div className="search-field d-none d-md-block">
                 <form className="d-flex align-items-center h-100" action="#">
                     <div className="input-group">
                         <div className="input-group-prepend bg-transparent">
                             <i className="input-group-text border-0 mdi mdi-magnify" />
                         </div>
                         <input type="text" className="form-control bg-transparent border-0" placeholder="Search Here"/>
                     </div>
                 </form>
             </div>

             <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
                 <span className="mdi mdi-menu" />
             </button>
         </div>
     </nav>
 )
};
export  default  Header;