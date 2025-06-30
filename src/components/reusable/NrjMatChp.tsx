import React from "react";
import { Divider, Chip } from "@mui/material";
type NrjChip = {
  title: string;
  color: string;
  textColor?: string;
};

const NrjMatChp = (props: NrjChip) => {
  let txtC: string = props.textColor ? props.textColor : "";
  let sty: {};
  if (txtC.length > 0) {
    sty = { backgroundColor: props.color, color: txtC };
  } else {
    sty = { backgroundColor: props.color };
  }
  return (
    <div>
      <Divider>
        <Chip label={props.title} color="default" style={sty}></Chip>
      </Divider>
    </div>
  );
};

export default NrjMatChp;
