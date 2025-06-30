import React, { useEffect, useReducer } from "react";
import utilities, { GetResponseWnds, createGetApi, dataStr_ToArray } from "../../utilities/utilities";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { nrjAxios } from "../../Hooks/useNrjAxios";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { Button } from "@mui/material";
import HdrDrp from "../HdrDrp";
// import { images } from '../../utilities/loadImages';



const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  SETGID: "gd",
  NEWFRMDATA: "frmdatanw",
  TRIGGER_TEXT: "triggertext",
  DISABLE: "disable",
  SET_HELPDATA: "helpdata"
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 0,
  errMsg: [],
  frmData: "",
  gid: "",
  whchFrm: 1,
  disableA: 1,
  disableB: 1,
  disableC: 0,
  dta: {
    screenTitle: 'CBWTF Information and Healthcare Facility Overview',
    description: ['This screen displays a table containing information about registered CBWTFs (Central Blood Waste Treatment Facilities). Users can view details about each CBWTF and use navigation links to access lists of healthcare facilities associated with specific CBWTFs. Additionally, users can print the CBWTF list table and the list of registered healthcare facilities.'],
    tableHeaders: [['cbwtf', 'Health Care Facility', 'Total Beds', 'Bedded HCF', 'Non-Bedded HCF', 'State', 'RD (Regional Directorate)'], [
      'Displays the name of registered CBWTFs. Users can click on a CBWTF name to view details about the healthcare facilities registered under it.',
      'Health Care Facility: Shows the total count of healthcare facilities registered under each CBWTF. Clicking on this data, value redirects users to a page displaying a list of healthcare facilities for the respective CBWTF.',
      'Displays the total count of beds available in each CBWTF.',
      'Shows the total count of healthcare facilities within each CBWTF that have beds. Clicking on this data value redirects users to a page listing bedded healthcare facilities under the respective CBWTF.',
      'Indicates the total count of healthcare facilities within each CBWTF that do not have bed facili,ties. Clicking on this data value redirects users to a page listing non-bedded healthcare facilities under the respective CBWTF.',
      'State: Shows the name of the state where the CBWTF is located.',
      'RD (Regional Directorate): Indicates the regional directorate to which each CBWTF belongs.'
    ]],
    buttons: [['button1', 'Allows users to print the current CBWTF information table for their records.'],
    ['button2', 'Allows users to print a list of registered healthcare facilities, based on their selection. This button can be used after clicking on specific CBWTF names or the "Bedded HCF" or "Non-Bedded HCF" values to print the respective lists.']
    ],
    guidelines: ['Users can browse the table to access key information about registered CBWTFs',
      'Clicking on CBWTF names, "Health Care Facility" counts, "Bedded HCF" counts, or "Non-Bedded HCF" counts will redirect users to relevant pages with more detailed information',
      'The print buttons facilitate the easy generation of printable versions of the CBWTF information table and lists of registered healthcare facilities.'
    ],
    screenshots: ['1','2']
  }
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  textDts: string;
  mainId: number;
  errMsg: any;
  frmData: string;
  gid: string;
  whchFrm: number;
  disableA: number,
  disableB: number,
  disableC: number,
  dta: any
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
      if (action.payload === 1) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
      }
      return newstate;
    case ACTIONS.NEWROWDATA:
      newstate.triggerG += 10;
      newstate.nwRow = action.payload;
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
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      newstate.rndm += 1;
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = [];
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.DISABLE:
      if (newstate.disableA == 1) {
        newstate.disableA = 0
      } else {
        newstate.disableA = 1
      }
      if (newstate.disableC == 3) {
        newstate.disableC = 0
      } else {
        newstate.disableC = 1
      }
      return newstate;
    case ACTIONS.SET_HELPDATA: 
      newstate.dta = action.payload
      return newstate;
    
  }
};




const HelpPage = () => {

  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('pathName');
  const hideScrollbar = {
    font: 'arial',
    overFlowX: 'auto'

  };

  useEffect(() => {
    if (path) {
      refetch();
    }
  }, [])


  const GetHelpData = () => {
    let api = createGetApi("db=nodb|dll=accdll|fnct=c142", `CPCB=hlpfls=${path}`);
    return nrjAxios({ apiCall: api });
  }

  const GetHelpDataSuccess = (data: any) => {
    let str: string = GetResponseWnds(data);
    if (str) {
      let data = str.split('|=|');
      let description: any[] = [];
      let tableHeaders: any[] = [[],[]];
      let guidelines:any[] = [];
      let screenshots: any[] = []
      let tempData:any[] = [];
      data.forEach((res:any)=>{
        tempData.push(dataStr_ToArray(res));
      })
      
      for(let i = 1; i < tempData[1]?.length; i++){
        description.push(tempData[1][i]['scndsc'].replace('$]$id',''))
      } 
      for(let i = 1; i < tempData[2]?.length; i++){
        if(tempData[2][i]['hdrttl']){
          tableHeaders[0].push(tempData[2][i]['hdrttl'].replace('$]$id',''));
        }
        if(tempData[2][i]['hdrdsc']){
          tableHeaders[1].push(tempData[2][i]['hdrdsc'].replace('$]$id',''));
        }
      }
      for(let i = 1; i < tempData[4]?.length; i++){
        guidelines.push(tempData[4][i]['usggd'].replace('$]$id',''))
      } 
      for(let i = 1; i < tempData[5]?.length; i++){
        screenshots.push(tempData[5][i]['scns'])
      } 
      dispatch({type:ACTIONS.SET_HELPDATA, payload:{
        screenTitle: tempData[0]? (tempData[0][1]['scnttl']? tempData[0][1]['scnttl'] : "") : "",
        description: description,
        tableHeaders: tableHeaders,
        buttons: [],
        guidelines: guidelines,
        screenshots: screenshots
      }})
    }
  }

  const { data, refetch } = useQuery({
    queryKey: ["getHelpFile", state.mainId, state.rndm],
    queryFn: GetHelpData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: GetHelpDataSuccess,  });

  return (
    <>
      <div className="bg-white text-black px-12">
        <div>
          <HdrDrp hideHeader={false}></HdrDrp>
        </div>
        <div className="shadow rounded-lg my-2 px-4 pb-2">



          <div className="text-center pt-2 text-xl font-extrabold">
            Page Information
          </div>

          <div className="flex">
            <div className="font-bold mr-2">
              Screen Title :
            </div>
            <div>
              {state.dta.screenTitle}
            </div>
          </div>

          <div className="my-4 border border-slate-200">
          </div>

          <div className="font-bold mr-2 mb-2">
            Screen Description :
          </div>
          <div>
            {state.dta.description}
          </div>


          <div className="my-4 border border-slate-200">
          </div>

          <div className="font-bold mr-2 mb-2">
            Table Headers :
          </div>

          <div className="px-4 py-3 bg-blue-500 flex justify-between overflow-x-auto" style={hideScrollbar}>
            {state.dta.tableHeaders[0]?.map((res: any) => {
              return <>
                <div className="font-bold">
                  {res}
                </div>
              </>
            })}
          </div>

          {state.dta.tableHeaders[0]?.map((res: any, index: number) => {
            return <>
              <div className="my-3 px-3">
                <span className="font-bold mr-2 text-sky-400 whitespace-nowrap">
                  {res} :
                </span>
                <span>
                  {state.dta.tableHeaders[1][index]}
                </span>
              </div>
            </>
          })}


          <div className="my-4 border border-slate-200">
          </div>

          <div className="font-bold mr-2 mb-3">
            Buttons :
          </div>

          {state.dta.buttons?.map((res: any, index: number) => {
            return <>
              <div className="flex my-4 px-3">
                <Button
                  size="medium"
                  style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                  variant="contained"
                  color="success"
                >
                  {res[0]}
                </Button>
                <div className="ml-4">
                  {res[1]}
                </div>
              </div>
            </>
          })}


          <div className="my-4 border border-slate-200">
          </div>

          <div className="font-bold mr-2 mb-2">
            Usage Guidelines:
          </div>


          {state.dta.guidelines?.map((res: any) => {
            return <>
              <div className="my-1 px-3">
                -{res}
              </div>
            </>
          })}
          
           <div className="my-4 border border-slate-200">
          </div>


          {state.dta.screenshots && <div className="font-bold mr-2 mb-2">
            screenshots:
          </div>}


          {/* {state.dta.screenshots.map((res: any) => {
            return <>
              <div key={res} className="my-1 px-3">
                <img
                key={res}
                src={images['ss_hcfcbwtf']}
              ></img>
              </div>
            </>
          })} */}

        </div>
      </div>

    </>
  );

};
export default React.memo(HelpPage);