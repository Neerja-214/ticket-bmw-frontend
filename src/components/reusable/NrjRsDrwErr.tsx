import moment from "moment";
import React, { useEffect, useState } from "react";
import { Drawer } from "rsuite";
type NrjDrwr = {
  openDrwr: boolean;
  msgList: string[];
  fontSize?: number;
};
function NrjRsDrwErr(props: NrjDrwr) {
  const [openDr, setOpenDrawer] = useState(props.openDrwr);

  useEffect(() => {
    setOpenDrawer(props.openDrwr);
  }, [props.openDrwr]);

  return (
    <div className="flex" style={{ marginLeft: 300, marginTop: 10 }}>
      <Drawer
        open={openDr}
        size="xs"
        backdrop={true}
        onClose={() => setOpenDrawer(false)}
      >
        <Drawer.Header
          style={{ fontSize: props.fontSize ? props.fontSize : 24 }}
        >
          Error on Save
        </Drawer.Header>
        <Drawer.Body style={{ border: 1, borderColor: "red" }}>
          
          {props.msgList.map((e: string) => (
            <div>
              <div style={{ color: "red", fontSize: 15 }} key={e}>
                {e}
              </div>

              <br></br>
            </div>
          ))}
          <div>Click Any Where to Close this or Press Escape</div>
          {/* <div style={{color:'red'}}>{errMsg}</div>  */}
        </Drawer.Body>
      </Drawer>
      <div></div>
      <div>{/* <NrjHdr cmpNm="A" dsplNm="b" name="Neerja"></NrjHdr> */}</div>
    </div>
  );
}

export default NrjRsDrwErr;
