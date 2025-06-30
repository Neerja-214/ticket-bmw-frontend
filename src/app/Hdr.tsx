import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import React from "react";

const Hdr = () => {
  
  return (
    // <>
    //   <div className="topBar">
    //     {" "}
    //     <div className="container">
    //       <img src={"https://www.amcservice.info/images/cpb/glpi.jpg"} alt="" /> 
    //       <CardContent sx={{ flex: "1 0 auto" }} className="cardimg">
    //        <Typography component="div" variant="h5" className="cardimg">
    //          <b>Central Pollution Control Board</b>
    //        </Typography>
    //        <Typography
    //          variant="subtitle1"
    //          color="text.secondary"
    //          component="div">
    //          <span className="cardimg1">Centralised Barcode System for Tracking of Biomedical Waste</span>
    //        </Typography>
    //      </CardContent>
    //     </div>
    //   </div>
    //   <div className="NavHeader">
    //     <div className="container"> Home | FAQ</div>
    //   </div>
    // </>
    <div>
       <Card sx={{ display: "flex" }}>
        <CardMedia
          component="img"
          sx={{ width: 100 }}
          style={{marginLeft: "100px"}}
          image="https://www.amcservice.info/images/cpb/glpi.jpg"
          alt="cpcb logo"
        />
        <CardContent sx={{ flex: "1 0 auto" }} className="cardimg">
          <Typography component="div" variant="h5" className="cardimg">
            <b>Central Pollution Control Board</b>
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div">
            <span className="cardimg1">Centralised Barcode System for Tracking of Biomedical Waste</span>
          </Typography>
        </CardContent>
      </Card>
      <div className="NavHeader">
         <div className="container">.</div>
       </div>
    </div>
  );
};

export default React.memo(Hdr);
