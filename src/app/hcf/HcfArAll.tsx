import React, { useEffect, useReducer, useState } from "react";
import utilities from "../../utilities/utilities";
import { Box, Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomTabPanel from "../Reports/CustomTabPanel";
import HcfArDaily from "./HcfArDaily";
import HcfAr from "./HcfAr";
import { Button, SvgIcon } from "@mui/material";

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  NEWROWDATAB: "newrowB",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  SETGID: "gd",
  NEWFRMDATA: "frmdatanw",
  DISABLE: "disable",
  FORM_DATA2: "formdata2",
  SETCOMBOSTRB: "cmbstrB",
  SETCOMBOSTRC: "cmbstrC",
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  nwRowB: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  gid: "",
  disableA: 1,
  disableB: 1,
  disableC: 1,
  combostrB: "",
  combostrC: "",
};

type purBill = {
  triggerG: number;
  nwRow: any;
  nwRowB: any;
  rndm: number;
  trigger: number;
  textDts: string;
  mainId: number;
  errMsg: any;
  openDrwr: boolean;
  frmData: string;
  gid: string;
  disableA: number;
  disableB: number;
  disableC: number;
};

type act = {
  type: string;
  payload: any;
};

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
      newstate.gid = "";
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      if (action.payload === 0) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
      }
      return newstate;
    case ACTIONS.NEWROWDATA:
      newstate.nwRow = action.payload;
      newstate.triggerG = 1;
      return newstate;
    case ACTIONS.NEWROWDATAB:
      newstate.triggerG = 1;
      newstate.nwRowB = action.payload;
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.FORM_DATA:
      let dta: string = "";
      let fldN: any = utilities(2, action.payload, "");
      if (newstate.textDts) {
        dta = newstate.textDts + "=";
        let d: any = utilities(1, dta, fldN);
        if (d) {
          dta = d;
        } else {
          dta = "";
        }
      }
      dta += action.payload;
      newstate.textDts = dta;
      return newstate;
    case ACTIONS.FORM_DATA2:
      let dta2: string = "";
      let fldN2: any = utilities(2, action.payload, "");
      if (newstate.textDts2) {
        dta2 = newstate.textDts2 + "=";
        let d: any = utilities(1, dta2, fldN2);
        if (d) {
          dta2 = d;
        } else {
          dta2 = "";
        }
      }
      dta2 += action.payload;
      newstate.textDts2 = dta2;
      return newstate;
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = [];
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRB:
      newstate.combostrB = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRC:
      newstate.combostrC = action.payload;
      return newstate;
    case ACTIONS.DISABLE:
      if (action.payload == 1) {
        if (newstate.disableA == 1) {
          newstate.disableA = 0;
        } else {
          newstate.disableA = 1;
        }
        return newstate;
      } else if (action.payload == 2) {
        if (newstate.disableB == 1) {
          newstate.disableB = 0;
        } else {
          newstate.disableB = 1;
        }
        return newstate;
      }

  }
};

const HcfArAll = (props: any) => {
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const navigate = useNavigate();


  const logout = ()=>{
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login")
  }

  const [valueType, setValueType] = useState(0);
  const handleChange = (event: React.SyntheticEvent | undefined, newValue: number) => {
    setValueType(newValue);
  }

  const [userChoice, setUserUserChoice] = useState();
  return (
    <>


      <div className='px-3 pb-10'>

        <div className='flex py-4 justify-end'>
          <Button
            size="medium"
            style={{ backgroundColor: "#86c6d9", textTransform: "none" }}
            variant="contained"
            color="success"
            disabled={false}
            onClick={logout}>
            Logout
          </Button>
        </div>
        <div className="rounded" style={{ boxShadow: '0px 0px 20px 0px #00000029' }}>
          <div className="p-7 rounded text-black" style={{ background: 'linear-gradient(90.29deg, #86c6d9 0%, #aed6e0 100%)' }}>
            <div className="text-2xl font-bold">Health Care Facility: Annual Report</div>
            <div className="">please provide the requested information below</div>
          </div>
          <div className="mx-7">
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={valueType} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Daily" {...a11yProps(0)} disabled={userChoice === 1} />
                <Tab label="Monthly" {...a11yProps(1)} disabled={userChoice === 0} />
              </Tabs>
            </Box>
            <CustomTabPanel value={valueType} index={0}>
              <div>
                <HcfArDaily></HcfArDaily>
              </div>
            </CustomTabPanel>
            <CustomTabPanel value={valueType} index={1}>
              <div>
                <HcfAr></HcfAr>
              </div>
            </CustomTabPanel>

          </Box>

          </div>
        </div>
      </div>
    </>
  );
};
export default React.memo(HcfArAll);
